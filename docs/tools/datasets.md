# Datasets

Upload, manage, and analyze data files for reporting and insights.

## Overview

The Datasets tool allows you to:
- Upload data files (CSV, Excel, JSON)
- View and explore data
- Merge multiple datasets
- Transform and clean data
- Use data in reports

## Accessing Datasets

Navigate to **Work > Datasets** in the sidebar.

## Uploading Datasets

### Supported Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| CSV | .csv | Comma-separated values |
| Excel | .xlsx, .xls | Microsoft Excel files |
| JSON | .json | JavaScript Object Notation |

### Upload Process

1. Click **Upload Dataset**
2. Drag and drop your file or click to browse
3. Wait for file processing
4. Review detected columns and data types
5. Enter dataset name and description
6. Click **Save**

### Upload Guidelines

- **Maximum file size:** 50MB
- **Maximum rows:** 100,000
- **Encoding:** UTF-8 recommended
- **Headers:** First row should contain column names

## Dataset Tabs

### All Datasets
View all datasets you have access to, including:
- Your uploads
- Shared datasets
- System datasets

### My Uploads
View only datasets you've personally uploaded.

### Transformed
View datasets created from merging or transforming other datasets.

## Viewing Datasets

Click on any dataset to view details:

### Overview Tab
- Dataset name and description
- File format and size
- Row and column counts
- Created and updated dates

### Data Preview Tab
- First 100 rows of data
- Column headers
- Data type indicators

### Schema Tab
- Column names
- Data types (string, number, date, etc.)
- Null value counts
- Statistics (min, max, mean for numbers)

## Dataset Actions

| Action | Description |
|--------|-------------|
| **View** | Open dataset details |
| **Edit** | Modify name/description |
| **Export** | Download in various formats |
| **Analyze** | Open in analysis tools |
| **Merge** | Combine with other datasets |
| **Delete** | Remove permanently |

## Merging Datasets

Combine multiple datasets into one:

### Step 1: Select Datasets
1. Check the boxes next to datasets to merge
2. Click **Merge Selected**

### Step 2: Configure Merge
Choose merge type:

| Type | Description |
|------|-------------|
| **Append** | Stack rows vertically |
| **Join** | Combine columns horizontally |
| **Left Join** | Keep all rows from first dataset |
| **Inner Join** | Keep only matching rows |

### Step 3: Map Columns
For joins, specify which columns to match on:
1. Select key column from first dataset
2. Select matching column from second dataset
3. Add additional key columns if needed

### Step 4: Review and Save
1. Preview merged result
2. Enter name for new dataset
3. Click **Create Merged Dataset**

## Data Quality

CHWOne analyzes your data for quality issues:

### Automatic Checks
- Missing values detection
- Duplicate row identification
- Data type consistency
- Outlier detection

### Quality Indicators
- 🟢 **Good** - Less than 5% issues
- 🟡 **Fair** - 5-15% issues
- 🔴 **Poor** - More than 15% issues

## Using Datasets in Reports

Datasets can be used to generate reports:

1. Go to **Reports**
2. Click **Create Report**
3. Select dataset(s) to include
4. Choose visualizations
5. Generate report

## Exporting Datasets

Download your data:

1. Click **Export** on any dataset
2. Choose format:
   - CSV
   - Excel
   - JSON
3. Select columns to include (optional)
4. Click **Download**

## Dataset Permissions

| Permission | Description |
|------------|-------------|
| **Owner** | Full control, can delete |
| **Editor** | Can modify and export |
| **Viewer** | Can view and export only |

## Best Practices

1. **Name descriptively** - Include date and source
2. **Add descriptions** - Document data contents
3. **Clean before upload** - Remove unnecessary columns
4. **Use consistent formats** - Standardize dates, numbers
5. **Regular backups** - Export important datasets

## Troubleshooting

### Upload fails?
- Check file size (max 50MB)
- Verify file format is supported
- Try re-saving file in UTF-8 encoding

### Data looks wrong?
- Check column delimiter (comma vs semicolon)
- Verify date formats
- Look for encoding issues

### Merge not working?
- Ensure key columns have matching values
- Check data types match
- Verify no duplicate column names

---

## Related Guides

- [Forms](./forms.md)
- [Reports](./reports.md)
