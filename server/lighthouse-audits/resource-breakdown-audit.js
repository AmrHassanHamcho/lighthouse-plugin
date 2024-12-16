// server/lighthouse-audits/resource-breakdown-audit.js
import Audit from 'lighthouse';

class ResourceBreakdownAudit extends Audit {
  static get meta() {
    return {
      id: 'resource-breakdown-audit',
      title: 'Resource Breakdown',
      description: 'Analyzes resource types and their data contribution',
      requiredArtifacts: ['NetworkRequests'], // Requires the NetworkRequests artifact
    };
  }

  static audit(artifacts) {
    const networkRequests = artifacts.NetworkRequests;

    if (!networkRequests || !networkRequests.length) {
      return {
        score: 0,
        details: {
          type: 'table',
          headings: [
            { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
            { key: 'size', itemType: 'text', text: 'Size (KB)' },
          ],
          items: [],
        },
      };
    }

    // Calculate resource sizes by type
    const resourceBreakdown = {};
    networkRequests.forEach((request) => {
      const type = request.resourceType || 'other';
      const size = request.transferSize || 0;
      resourceBreakdown[type] = (resourceBreakdown[type] || 0) + size;
    });

    const totalSize = Object.values(resourceBreakdown).reduce((a, b) => a + b, 0);
    const items = Object.entries(resourceBreakdown).map(([type, size]) => ({
      resourceType: type,
      size: (size / 1024).toFixed(2), // Convert to KB
      contribution: ((size / totalSize) * 100).toFixed(2), // Percentage
    }));

    return {
      score: 1,
      details: {
        type: 'table',
        headings: [
          { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
          { key: 'size', itemType: 'text', text: 'Size (KB)' },
          { key: 'contribution', itemType: 'text', text: 'Contribution (%)' },
        ],
        items,
      },
    };
  }
}

module.exports = ResourceBreakdownAudit;
