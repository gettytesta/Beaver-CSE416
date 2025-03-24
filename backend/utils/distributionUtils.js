/**
 * Generates a random value from a normal distribution
 * @param {number} mean - The mean of the distribution
 * @param {number} stdev - The standard deviation of the distribution
 * @returns {number} A random value from the distribution
 */
function generateNormalRandom(mean, stdev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdev + mean;
}

/**
 * Samples a value from a distribution object
 * @param {Object} distObj - The distribution object
 * @param {string} distObj.type - The type of distribution ('fixed', 'normal', 'uniform')
 * @returns {number} A sampled value from the distribution
 */
function sampleValueFromDistribution(distObj) {
    if (!distObj || !distObj.type) {
        throw new Error('Invalid distribution object');
    }

    switch (distObj.type) {
        case 'fixed':
            return distObj.value;

        case 'normal':
            return generateNormalRandom(distObj.mean, distObj.stdev);

        case 'uniform':
            return distObj.lower + Math.random() * (distObj.upper - distObj.lower);

        default:
            throw new Error(`Unknown distribution type: ${distObj.type}`);
    }
}

module.exports = {
    sampleValueFromDistribution,
    generateNormalRandom,
};