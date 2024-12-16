export default {
  extends: 'lighthouse:default',
  audits: ['./lighthouse-audits/resource-breakdown-audit.js'],
  categories: {
      sustainability: {
          title: 'Sustainability',
          description: 'Insights into resource consumption for sustainable development',
          auditRefs: [
              { id: 'resource-breakdown-audit', weight: 1 },
          ],
      },
  },
};
