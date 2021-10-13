var uploadSpreadsheetForm = document.getElementById('uploadSpreadsheetForm');
var spreadsheetInput = document.getElementById('spreadsheetInput');
var uploadButton = document.getElementById('uploadButton');
var processingMessage = document.getElementById('processingMessage');

uploadButton.disabled = true;

spreadsheetInput.addEventListener('change', enableButton);

uploadSpreadsheetForm.addEventListener('submit', handleSubmit);

function enableButton() {
  if (spreadsheetInput.value === '') {
    uploadButton.disabled = true;
  } else {
    uploadButton.disabled = false;
  }
}

function handleSubmit() {
  uploadButton.disabled = true;
  processingMessage.innerHTML = 'Processing, please wait...'
}
