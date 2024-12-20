import { Audit } from 'lighthouse';
import { NetworkRecords } from 'lighthouse/core/computed/network-records.js';
import { co2 } from '@tgwf/co2';

export default class CO2EstimationAudit extends Audit {
  static get meta() {
    return {
      id: 'co2-estimation-audit',
      title: 'CO2 Emissions Estimation',
      failureTitle: 'CO2 emissions estimation failed.',
      description: 'Estimates the CO2 emissions caused by loading the webpage resources.',
      requiredArtifacts: ['devtoolsLogs'], // Use devtoolsLogs
    };
  }

  static async audit(artifacts, context) {
    const devtoolsLogKey = Object.keys(artifacts.devtoolsLogs)[0];
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
            { key: 'co2', itemType: 'numeric', text: 'Estimated CO2 (g)' },
          ],
          items: [],
        },
      };
    }

    let networkRecords;
    try {
      networkRecords = await NetworkRecords.request(devtoolsLog, context);
    } catch (error) {
      console.error('Failed to extract network records:', error.message);
      return {
        score: 0,
        details: {
          type: 'table',
          headings: [
            { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
            { key: 'size', itemType: 'numeric', text: 'Total Size (MB)' },
            { key: 'co2', itemType: 'numeric', text: 'Estimated CO2 (g)' },
          ],
          items: [],
        },
      };
    }

    const resourceSizes = {};
    let totalSize = 0;

    networkRecords.forEach((req) => {
      const type = req.resourceType || 'other';
      const size = req.transferSize || 0;

      resourceSizes[type] = (resourceSizes[type] || 0) + size;
      totalSize += size;
    });

    const co2Calculator = new co2(); // Initialize CO2 calculator
    const totalSizeInMB = totalSize / (1024 * 1024); // Convert to MB
    const totalCO2Estimate = co2Calculator.perByte(totalSize); // Estimate CO2 in grams for total size
    
    const items = Object.entries(resourceSizes).map(([type, size]) => {
      const sizeInMB = size / (1024 * 1024);
      const co2Estimate = co2Calculator.perByte(size); // CO2 per resource type

      return {
        resourceType: type,
        size: parseFloat(sizeInMB.toFixed(2)),
        co2: parseFloat(co2Estimate.toFixed(2)),
      };
    });

    return {
      score: totalCO2Estimate > 0 ? 1 : 0,
      details: {
        type: 'table',
        headings: [
          { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
          { key: 'size', itemType: 'numeric', text: 'Total Size (MB)' },
          { key: 'co2', itemType: 'numeric', text: 'Estimated CO2 (g)' },
        ],
        items,
      },
    };
  }
}
