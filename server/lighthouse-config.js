// // lighthouse-config.js
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export default {
//   extends: 'lighthouse:default',
//   audits: [path.resolve(__dirname, './lighthouse-audits/resource-breakdown-audit.js')],
//   categories: {
//     sustainability: {
//       title: 'Sustainability',
//       description: 'Analyzes resource consumption for sustainable development.',
//       auditRefs: [
//         { id: 'resource-breakdown-audit', weight: 1 },
//       ],
//     },
//   },
// };
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  extends: 'lighthouse:default',
  audits: [
    path.resolve(__dirname, './lighthouse-audits/resource-breakdown-audit.js'),
    path.resolve(__dirname, './lighthouse-audits/co2-estimation-audit.js'), // Add CO2 audit
  ],
  categories: {
    sustainability: {
      title: 'Sustainability',
      description: 'Analyzes resource consumption and environmental impact.',
      auditRefs: [
        { id: 'resource-breakdown-audit', weight: 1 },
        { id: 'co2-estimation-audit', weight: 1 }, // Reference CO2 audit
      ],
    },
  },
};
