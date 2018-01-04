chrome.runtime.onMessage.addListener (
    function (request, sender, sendResponse) {
        if (request.Message == "getTrelloAPIKey") {

			chrome.storage.sync.get({
				'api_key': ''
				},
				function(items){
					var api_key = items.api_key;

					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, {key: api_key}, function(response) {
							;
						});
					});
				});
        }
        else {
        	if (request.Message == "getTrelloBoardID") {

			chrome.storage.sync.get({
				'board_id': ''
				},
				function(items){
					var board_id = items.board_id;

					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, {trello_board: board_id}, function(response) {
							;
						});
					});
				});
        	} else {
        		console.log("Did not receive the response!!!")	
        	}
            
        }
    }
);