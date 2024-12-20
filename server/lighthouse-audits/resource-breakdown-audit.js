
// resource-breakdown-audit.js
import { Audit } from 'lighthouse';
import { NetworkRecords } from 'lighthouse/core/computed/network-records.js';

export default class ResourceBreakdownAudit extends Audit {
  static get meta() {
    return {
      id: 'resource-breakdown-audit',
      title: 'Resource Breakdown',
      failureTitle: 'Resource breakdown audit failed.',
      description: 'Analyzes page resources and their contributions.',
      requiredArtifacts: ['devtoolsLogs'], // Use devtoolsLogs
    };
  }

  static async audit(artifacts, context) {
    console.log('Running Resource Breakdown Audit');

    const devtoolsLogKey = Object.keys(artifacts.devtoolsLogs)[0]; // Get the first key
    const devtoolsLog = artifacts.devtoolsLogs[devtoolsLogKey];

    if (!devtoolsLog) {
      console.warn('No valid devtools logs found');
      return {
        score: 0,
        details: {
          type: 'table',
          headings: [
            { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
            { key: 'size', itemType: 'numeric', text: 'Total Size (MB)' },
            { key: 'contribution', itemType: 'numeric', text: 'Contribution (%)' },
          ],
          items: [],
        },
      };
    }

    let networkRecords;
    try {
      networkRecords = await NetworkRecords.request(devtoolsLog, context);
      console.log('Extracted Network Records:', networkRecords); // Debug network records
    } catch (error) {
      console.error('Failed to extract network records:', error.message);
      return {
        score: 0,
        details: {
          type: 'table',
          headings: [
            { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
            { key: 'size', itemType: 'numeric', text: 'Total Size (MB)' },
            { key: 'contribution', itemType: 'numeric', text: 'Contribution (%)' },
          ],
          items: [],
        },
      };
    }

    if (!networkRecords || !networkRecords.length) {
      console.warn('Network Records are empty');
      return {
        score: 0,
        details: {
          type: 'table',
          headings: [
            { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
            { key: 'size', itemType: 'numeric', text: 'Total Size (MB)' },
            { key: 'contribution', itemType: 'numeric', text: 'Contribution (%)' },
          ],
          items: [],
        },
      };
    }

    const resourceSizes = {};
    let totalSize = 0;

    networkRecords.forEach((req) => {
      const type = req.resourceType || 'other';
      const size = req.transferSize || 0; // Use transferSize; fallback to 0 if missing

      resourceSizes[type] = (resourceSizes[type] || 0) + size;
      totalSize += size;
    });

    const items = Object.entries(resourceSizes).map(([type, size]) => {
      const sizeInMB = (size / (1024 * 1024)).toFixed(2);
      const contribution = ((size / totalSize) * 100).toFixed(2);
      return {
        resourceType: type,
        size: parseFloat(sizeInMB),
        contribution: parseFloat(contribution),
      };
    });

    return {
      score: 1,
      details: {
        type: 'table',
        headings: [
          { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
          { key: 'size', itemType: 'numeric', text: 'Total Size (MB)' },
          { key: 'contribution', itemType: 'numeric', text: 'Contribution (%)' },
        ],
        items,
      },
    };
  }
}