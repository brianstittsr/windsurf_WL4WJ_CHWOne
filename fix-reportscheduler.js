const fs = require('fs');
const path = require('path');

// Fix ReportScheduler.tsx
const reportSchedulerPath = path.join(__dirname, 'src', 'components', 'Grants', 'wizard', 'dashboard', 'ReportScheduler.tsx');

// Read file
console.log('Reading ReportScheduler.tsx...');
let reportSchedulerContent = fs.readFileSync(reportSchedulerPath, 'utf8');

// Remove the duplicate key prop
console.log('Fixing duplicate key prop...');
reportSchedulerContent = reportSchedulerContent.replace(
  '<Chip\n                      key={index}\n                      variant="outlined"',
  '<Chip\n                      variant="outlined"'
);
console.log('Removed duplicate key prop');

// Write file back
console.log('Saving changes...');
fs.writeFileSync(reportSchedulerPath, reportSchedulerContent);

console.log('Fix completed!');
