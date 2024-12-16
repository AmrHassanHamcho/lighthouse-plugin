import { Audit } from 'lighthouse';
console.log("inside audit")
export default class ResourceBreakdownAudit extends Audit {
  static get meta() {
    return {
      id: 'resource-breakdown-audit',
      title: 'Resource Breakdown',
      failureTitle: 'Resource breakdown audit failed.',
      description: 'Analyzes page resources and their contributions.',
      requiredArtifacts: ['devtoolsLogs', 'traces'],
    };
  }

  static audit(artifacts) {
    console.log('Running Resource Breakdown Audit'); // Debug log
    const networkRequests = artifacts.NetworkRequests || [];
    if (!networkRequests.length) {
      console.error('No NetworkRequests available');
      return {
        score: 0,
        details: {
          type: 'table',
          headings: [
            { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
            { key: 'size', itemType: 'numeric', text: 'Size (KB)' },
          ],
          items: [],
        },
      };
    }

    const results = networkRequests.map(req => ({
      resourceType: req.resourceType || 'other',
      size: (req.transferSize / 1024).toFixed(2),
    }));

    return {
      score: 1,
      details: {
        type: 'table',
        headings: [
          { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
          { key: 'size', itemType: 'numeric', text: 'Size (KB)' },
        ],
        items: results,
      },
    };
  }
}
