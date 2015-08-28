$(function() {
  var $sendFormButton = $('#send-form-button');
  var $sendFormTextarea = $('#send-form-textarea');
  var $reloadButton = $('#reload-button');
  var $trashButton = $('#trash-button');
  var $errorMessage = $('#error-message');

  function showErrorMessage() {
    $errorMessage.show();
  }

  function refreshDownloads() {
    location.reload();
  }

  function trashCompletedDownloads() {
    $.ajax({
      type: 'DELETE',
      url: '/api/download/not-running',
      success: refreshDownloads,
      error: showErrorMessage
    });
  }

  function sendForm() {
    // Get user input
    var links = $sendFormTextarea.val().split('\n');

    // Send a request to API for each link
    links.forEach(function(link) {
      // Preapare data
      var request = JSON.stringify({
        url: link,
      });

      // Post data to API
      $.ajax({
        type: 'POST',
        url: '/api/download',
        data: request,
        success: refreshDownloads,
        error: showErrorMessage,
        contentType: 'application/json'
      });
    });

    // Clear text area
    $sendFormTextarea.val('');
  }

  // Configure buttons
  $sendFormButton.click(sendForm);
  $reloadButton.click(refreshDownloads);
  $trashButton.click(trashCompletedDownloads);
});
