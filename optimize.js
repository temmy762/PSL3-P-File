// Optimize website for production
// Run this script before uploading to Hostinger

// Include necessary modules
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const config = {
  // Directories to process
  directories: {
    html: ['./', './pages'],
    css: ['./assets/css'],
    js: ['./assets/js']
  },
  // File extensions to process
  extensions: {
    html: ['.html'],
    css: ['.css'],
    js: ['.js']
  },
  // Commands for minification (requires respective npm packages)
  commands: {
    html: 'html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype',
    css: 'cleancss -o',
    js: 'uglifyjs --compress --mangle --output'
  }
};

// Function to check if required tools are installed
function checkRequiredTools() {
  console.log('Checking required tools...');
  
  return new Promise((resolve, reject) => {
    const required = ['html-minifier', 'clean-css-cli', 'uglify-js'];
    let missing = [];
    
    for (const tool of required) {
      try {
        require.resolve(tool);
      } catch (e) {
        missing.push(tool);
      }
    }
    
    if (missing.length > 0) {
      console.error(`Missing required tools: ${missing.join(', ')}`);
      console.log('Install required tools using: npm install -g ' + missing.join(' '));
      reject(new Error('Missing required tools'));
    } else {
      console.log('All required tools installed');
      resolve();
    }
  });
}

// Function to process a file
function processFile(filePath, fileType) {
  const outputPath = filePath.replace(/\.(html|css|js)$/, '.min.$1');
  const command = `${config.commands[fileType]} ${outputPath} ${filePath}`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error processing ${filePath}: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`Warning: ${stderr}`);
      }
      
      console.log(`Processed ${filePath} -> ${outputPath}`);
      resolve();
    });
  });
}

// Function to find and process all files
async function processAllFiles() {
  console.log('Processing files...');
  
  for (const [fileType, dirs] of Object.entries(config.directories)) {
    const extensions = config.extensions[fileType];
    
    for (const dir of dirs) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const ext = path.extname(file);
        
        if (extensions.includes(ext)) {
          try {
            await processFile(filePath, fileType);
          } catch (error) {
            console.error(`Failed to process ${filePath}: ${error.message}`);
          }
        }
      }
    }
  }
  
  console.log('All files processed');
}

// Main function
async function main() {
  console.log('Starting website optimization...');
  
  try {
    await checkRequiredTools();
    await processAllFiles();
    console.log('Website optimization complete. Files are ready for upload.');
  } catch (error) {
    console.error(`Optimization failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
