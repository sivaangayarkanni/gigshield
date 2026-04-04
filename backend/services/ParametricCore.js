const Policy = require('../models/Policy');
const Claim = require('../models/Claim');

/**
 * ParametricCore Service
 * Handles real-time monitoring of weather and platform data to trigger claims.
 */
class ParametricCore {
  constructor(io) {
    this.io = io;
  }

  /**
   * Process a Weather Trigger (e.g., from a Webhook or Simulated Scanner)
   * @param {Object} data - { type: 'STORM', intensity: 85, location: { lat, lng } }
   */
  async handleWeatherTrigger(data) {
    console.log(`[ParametricCore] Processing ${data.type} Trigger...`);

    // 1. Find active policies for workers in this zone
    // For the demo, we'll find all ACTIVE STORM_COVER policies
    const policies = await Policy.find({ status: 'ACTIVE', type: 'STORM_COVER' }).populate('workerId');

    for (const policy of policies) {
      // 2. Automated Fraud Check (GPS Integrity)
      const isNearby = this.verifyLocation(data.location, policy.workerId.lastKnownLocation);
      
      if (isNearby) {
        // 3. Create Automated Claim
        const claim = new Claim({
          workerId: policy.workerId._id,
          policyId: policy._id,
          status: 'APPROVED',
          amount: policy.coverageAmount,
          triggerReason: `Severe ${data.type} detected (Intensity: ${data.intensity}%)`,
          gpsLocation: {
            lat: policy.workerId.lastKnownLocation.lat,
            lng: policy.workerId.lastKnownLocation.lng,
            isVerified: true
          }
        });

        await claim.save();

        // 4. Trigger Real-time Notification
        this.io.to(policy.workerId._id.toString()).emit('claim_payout_triggered', {
          amount: claim.amount,
          reason: claim.triggerReason,
          icon: 'cloud-lightning'
        });

        console.log(`✅ Automatic payout triggered for ${policy.workerId.firstName}`);
      }
    }
  }

  /**
   * Process a Surge Gap Trigger
   */
  async handleSurgeGap(workerId, platformSurge, expectedSurge) {
    if (platformSurge < expectedSurge) {
      const gap = expectedSurge - platformSurge;
      const policy = await Policy.findOne({ workerId, type: 'SURGE_GAP', status: 'ACTIVE' });

      if (policy) {
        const claim = new Claim({
          workerId,
          policyId: policy._id,
          status: 'PAID',
          amount: gap * 10, // Simulated multiplier
          triggerReason: `Surge Gap Coverage (Expected: ${expectedSurge}, Actual: ${platformSurge})`
        });

        await claim.save();
        this.io.to(workerId.toString()).emit('surge_gap_compensated', { amount: claim.amount });
      }
    }
  }

  verifyLocation(triggerLoc, workerLoc) {
    // Simple proximity logic for demo (within 0.1 degree)
    if (!workerLoc) return true; // Default to true if no location for demo
    const distance = Math.sqrt(
      Math.pow(triggerLoc.lat - workerLoc.lat, 2) + 
      Math.pow(triggerLoc.lng - workerLoc.lng, 2)
    );
    return distance < 0.1;
  }
}

module.exports = ParametricCore;
