const fs = require('fs');
const path = require('path');

// Fix Step6FormGenerator.tsx
const formGeneratorPath = path.join(__dirname, 'src', 'components', 'Grants', 'wizard', 'steps', 'Step6FormGenerator.tsx');
const reportSchedulerPath = path.join(__dirname, 'src', 'components', 'Grants', 'wizard', 'dashboard', 'ReportScheduler.tsx');

// Read files
console.log('Reading files...');
let formGeneratorContent = fs.readFileSync(formGeneratorPath, 'utf8');
let reportSchedulerContent = fs.readFileSync(reportSchedulerPath, 'utf8');

// Fix Step6FormGenerator.tsx - remove extra closing brace on line 1171
console.log('Fixing Step6FormGenerator.tsx...');
const lines = formGeneratorContent.split('\n');
if (lines[1170].trim() === ')}') {
  lines[1170] = lines[1170].replace(')}', ')');
  console.log('Fixed syntax error on line 1171');
}
formGeneratorContent = lines.join('\n');

// Fix ReportScheduler.tsx - add key prop to Chip component around line 402
console.log('Fixing ReportScheduler.tsx...');
reportSchedulerContent = reportSchedulerContent.replace(
  '<Chip\n                      variant="outlined"\n                      label={option}\n                      size="small"',
  '<Chip\n                      key={index}\n                      variant="outlined"\n                      label={option}\n                      size="small"'
);
console.log('Added key prop to Chip component');

// Write files back
console.log('Saving changes...');
fs.writeFileSync(formGeneratorPath, formGeneratorContent);
fs.writeFileSync(reportSchedulerPath, reportSchedulerContent);

console.log('All fixes completed!');
