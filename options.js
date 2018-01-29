function save_options() {
  
  var api_key = document.getElementById('api_key').value;
  document.getElementById("key_status").innerHTML = "Key Saved";

  var board_id = document.getElementById('board_id').value;
  document.getElementById("board_status").innerHTML = "Board Saved";


  chrome.storage.sync.set({
      api_key: api_key,
      board_id: board_id
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');

      status.textContent = 'Options saved.';
      document.getElementById("status").innerHTML = "Options saved.";
      setTimeout(function() {
        status.textContent = '';
      }, 1500);
    });

};


function restore_options() {
  chrome.storage.sync.get({
    api_key: '',
    board_id: ''
  }, function(items) {
    document.getElementById('api_key').value = items.api_key;
    document.getElementById('board_id').value = items.board_id;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);