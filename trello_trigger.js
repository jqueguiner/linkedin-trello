var key = "";

var trello_list = "";

var trello_board = "";

const linkedin_actions_section_class = "pvs-profile-actions"
const linkedin_name_classes_selector = ".text-heading-xlarge.inline.t-24.v-align-middle.break-words"
const linkedin_action_button_class = "pvs-profile-actions__action artdeco-button artdeco-button--2 artdeco-button--primary ember-view"
const linkedin_action_span_class = "artdeco-button__text"
const linkedin_top_card_class_selector = ".artdeco-card.ember-view.pv-top-card"
const trello_user_card_section_id = "trello_user_card"
const trello_comments_section_id = "trello_comments"
const trello_status_section_id = "trello_status_mgr"
const trello_actions_section_id = "trello_actions"

const linkedin_section_container_title_function = (title) => `
  <div class="pvs-header__container">
    <div class="pvs-header__top-container--no-stack">
      <div class="pvs-header__left-container--stack">
        <div class="pvs-header__title-container">
          <h2 class="pvs-header__title text-heading-large">
            <span aria-hidden="true"><!---->${title}<!----></span><span class="visually-hidden"><!---->${title}<!----></span>
          </h2>
        </div>
      </div>
    </div>
  </div>
  `

  const linkedin_section_container_content_function = (content) => `
  <div class="display-flex ph5 pv3">
    <div class="display-flex full-width">  
      <div class="pv-shared-text-with-see-more t-14 t-normal t-black display-flex align-items-center">
        <div class="inline-show-more-text" style="line-height:1.9rem;">
          <span aria-hidden="true">${content}</span>
        </div>
      </div>
    </div>
  </div>
`

const linkedin_section_container_section_function = (id, title, content) => `
  <section id="${id}" class="artdeco-card ember-view break-words pb3 mt2">
    ${linkedin_section_container_title_function(title)}
    ${linkedin_section_container_content_function(content)}
  </section>
`

const extension_name = "Trello Linkedin Connector"

// name of the user
const name = $(linkedin_name_classes_selector).text();

var card_id = ""

$(document).ready(function () {
  if (key == "") {
    console.log("Get Trello API Key");

    chrome.runtime.sendMessage(
      { Message: "getTrelloAPIKey" },
      function (response) {
      }
    );
    // accept messages from background
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (typeof request.key !== "undefined") {
        key = request.key;
        // console.log("trello app key :" + request.key);

        window.Trello.setKey(key);

        window.Trello.authorize({
          type: "redirect",
          interactive: true,
          persist: true,
          expiration: "never",
          name: extension_name,
          scope: {
            read: "true",
            write: "true",
            account: false
          },
          success: authenticationSuccess,
          error: authenticationFailure,
        });
      }
    });
  }
});

$(document).ready(function () {
  if (trello_board == "") {
    console.log("Get Trello Board ID");
    chrome.runtime.sendMessage(
      { Message: "getTrelloBoardID" },
      function (response) {}
    );
    // accept messages from background
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (typeof request.trello_board !== "undefined") {
        trello_board = request.trello_board;
        console.log("board_id :" + request.trello_board);
      }
    });
  }
});

var script_trello = document.createElement("script");

var trello_btn = document.createElement("trello");

var massive_connect_btn = document.createElement("massive_connect");

var btn_html = function (id, text) {
  return (
    `<button id="${id}" class="${linkedin_action_button_class}">
      <span id="${id}" class="${linkedin_action_span_class}">${text}</span>
    </button>`
  );
};

trello_btn.innerHTML = btn_html("addToTrello", "Add To Trello");

massive_connect_btn.innerHTML = btn_html("massiveConnect", "Massive Connect");
//pvs - profile - actions;

var parent = document.getElementsByClassName(linkedin_actions_section_class);

function wait(ms) {
  var d = new Date();
  var d2 = null;
  do {
    d2 = new Date();
  } while (d2 - d < ms);
}

function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}

var url = decodeURI(window.location.href);

var cut = getPosition(url, "/", 5);

url = url.substring(0, cut);

var found_card_url = null;

var found_card = false;
var not_seen = true;
var not_connected = true;

var listName = null;

var authenticationSuccess = function () {
  console.log("Successful authentication");
  token = window.Trello.token();
};

var authenticationFailure = function () {
  console.log("Failed authentication");
};

var creationSuccess = function (data) {
  console.log("Card created successfully");
  console.log(JSON.stringify(data, null, 2));
};

var foundListSuccess = function (data) {
  console.log("List retrieved");
  $("#listName").text(data.name);
};

var foundCommentsSuccess = function (data) {
  console.log("Comments retrieved");

  var comments = "";
  console.log(data)
  $.each(data, function (i, comment) {
    comments = comments.concat(
      `<b>
        ${comment.date.substring(0, 10)}
        (${comment.memberCreator.initials})</b>:
      ${comment.data.text}
      <br/>
      `
    );
  });

  $(linkedin_top_card_class_selector).first().next().after(linkedin_section_container_section_function(id=trello_comments_section_id,title="Trello Comments", content=comments))
  
};

var foundCommentsFailure = function (data) {
  console.log("Card Comments not retrieved");
  return false;
};

var foundLabelsSuccess = function (data) {

  // Fetching the recruiting labels
  var out = "";

  // Fetching the recruiting steps / swimlanes
  $.each(data, function (i, label) {
    if(label.name !== "") {
      out = out.concat(
        `<button 
          style="background-color:#44c767;-moz-border-radius:6px;-webkit-border-radius:6px;border-radius:6px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;padding:2px 2px;text-decoration:none;text-shadow:0px 1px 0px #2f6627;" 
          class="changeLabel" 
          labelId="${label.id}"
          labelName="${label.name}"> 
          Change label to ${label.name}
        </button>
        </br>`
      );
    }
  });


  $(linkedin_top_card_class_selector).first().next().after(linkedin_section_container_section_function(id=trello_status_section_id, title="Label Manager", content=out))


  $("#allLabels").html(out);

  $(".changeLabel").each(function (index) {
    if ($(this).attr("labelId") == $("#labelName").attr("current_labelId")) {
      $(this).css("background-color", "red");
    } else {
      $(this).css("background-color", "#44c767");
    }
  });

  $(document).on('click', '.changeLabel', function () {
    var move_to_labelId = $(this).attr("labelId");
    
    window.Trello.put(`cards/${card_id}/idLabels`, {
      value: move_to_labelId,
    })

    $("#labelName").html($(this).attr("labelName"));
    $("#labelName").attr("current_labelId", move_to_labelId);

    $(".changeLabel").each(function (index) {
      if ($(this).attr("labelId") == $("#labelName").attr("current_labelId")) {
        $(this).css("background-color", "red");
      } else {
        $(this).css("background-color", "#44c767");
      }
    });
  });

  $(document).on('click', '.close', function () {
    window.Trello.delete(`cards/${card_id}`);
  });
};

var foundLabelsFailure = function () {
  console.log("Failed retrieving label list");
};


var foundListsSuccess = function (data) {

  // Fetching the recruiting steps / swimlanes
  
  var out = "";
  out = out.concat(
    `<button 
      style="background-color:#39aaf1;-moz-border-radius:6px;-webkit-border-radius:6px;border-radius:6px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;padding:2px 2px;text-decoration:none;text-shadow:0px 1px 0px #2f6627;" 
      class="comment" 
      id="addComment"
      >
      Add comment
    </button>
    </br>`
  );
  
  // Fetching the recruiting steps / swimlanes
  $.each(data, function (i, list) {
    out = out.concat(
      `<button 
        style="background-color:#44c767;-moz-border-radius:6px;-webkit-border-radius:6px;border-radius:6px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;padding:2px 2px;text-decoration:none;text-shadow:0px 1px 0px #2f6627;" 
        class="changeStatus" 
        listId="${list.id}"
        listName="${list.name}"> 
        Change status to ${list.name}
      </button>
      </br>`
    );
  });

  out = out.concat(
    `<button 
      style="background-color:#FB8166;-moz-border-radius:6px;-webkit-border-radius:6px;border-radius:6px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;padding:2px 2px;text-decoration:none;text-shadow:0px 1px 0px #2f6627;" 
      class="close">
      Delete Card
    </button>
    </br>`
  );

  $(linkedin_top_card_class_selector).first().after(linkedin_section_container_section_function(id=trello_status_section_id, title="Status Manager", content=out))

  $("#addToTrello").remove();

  $("#allLists").html(out);


  $(document).on('click', '#addComment', function () {
    var new_comment = prompt(
      "Please enter your comment",
      "I love Harry Potter !"
    );

    window.Trello.post(`cards/${card_id}/actions/comments?text=${new_comment}`);
    
    $(`#${trello_comments_section_id}`).remove()
    $(`#${trello_status_section_id}`).remove()
    $(`#${trello_user_card_section_id}`).remove()
    
    not_seen = true;
  });

  $(".changeStatus").each(function (index) {
    if ($(this).attr("listId") == $("#listName").attr("current_listId")) {
      $(this).css("background-color", "red");
    } else {
      $(this).css("background-color", "#44c767");
    }
  });


  $(document).on('click', '.changeStatus', function () {
    var move_to_listId = $(this).attr("listId");
    
    //needs 1 put + second trigger to bypass chrome security policy
    
    window.Trello.put(`cards/${card_id}`, {
      idList: move_to_listId,
    })

    $("#listName").html($(this).attr("listName"));
    $("#listName").attr("current_listId", move_to_listId);

    $(".changeStatus").each(function (index) {
      if ($(this).attr("listId") == $("#listName").attr("current_listId")) {
        $(this).css("background-color", "red");
      } else {
        $(this).css("background-color", "#44c767");
      }
    });
  });

  $(document).on('click', '.close', function () {
    window.Trello.delete(`cards/${card_id}`);
  });
};

var foundListsFailure = function () {
  console.log("Failed retrieving board list");
};


var foundCardSuccess = function (data) {
  console.log("Card retrieved");

  //for each card in trello
  $.each(data, function (index, card) {
    // pick on the one that is related to the 
    // current profil
    if (card.name == name) {
      card_id = card.id
      console.log(card)
    
      found_card_url = card.shortUrl;
      //pvs-header__container
      // build the card
      var flatten_labels = ""
      var current_labelId = ""
      $.each(card.labels, function(index, label) {flatten_labels = flatten_labels.concat(label.name + "</br>"); current_labelId = label.id})
      console.log(flatten_labels)
      existing_card =
        `
          <b>Id:</b><a href="${card.shortUrl}">${card.id}</a><br>
          <b>Name:</b> ${card.name}<br>
          <b>Status:</b> <div id="listName" current_listId="${card.idList}"></div>
          <b>Label:</b> <div id="labelName" current_labelId="${current_labelId}">${flatten_labels}</div>
          <b>Last Activity:</b> ${card.dateLastActivity}</br>
        `;
      
      $(linkedin_top_card_class_selector).first().after(linkedin_section_container_section_function(id=trello_user_card_section_id,title="Trello User Card", content=existing_card))

      $("#addToTrello").remove();

      window.Trello.get(`lists/${card.idList}`, foundListSuccess);
      
      window.Trello.get(
        `boards/${trello_board}/lists/`,
        foundListsSuccess,
        foundListsFailure
      );

      window.Trello.get(
        `cards/${card.id}/actions?filter=commentCard`,
        foundCommentsSuccess,
        foundCommentsFailure
      );

      window.Trello.get(
        `boards/${trello_board}/labels/`,
        foundLabelsSuccess,
        foundLabelsFailure
      );

    }
  });

  return found_card_url;
};

var foundCardFailure = function (data) {
  console.log("Card not retrieved");

  return false;
};

// linkedin/in profil
$(document).ready(function () {


  var checkContents = setInterval(function () {

    // if it's a linkedin search page
    if (window.location.href.indexOf("/search/results/") > 0) {
      not_seen = false;
    }

    if (not_seen) {
      
      // action button section
      if ($(`.${linkedin_actions_section_class}`).length > 0) {
        not_seen = false;

        $(`.${linkedin_actions_section_class}`).prepend(trello_btn);
        try {

          not_connected = false;

          // create the Add To Trello button action
          // this will trigger a popup to create a card in 
          // Trello and then remove the add to trello button
          $(document).on('click', '#addToTrello', function() {

            $("#addToTrello").remove();
            
            // Trello card setup
            var newCard = {
              name: name,
              desc: url,
              url: url,
              idBoard: trello_board,
              pos: "top",
            };

            // Add Trello Card
            window.Trello.addCard(newCard);

            // Update the list of Trello status for the current profil
            window.Trello.get(`lists/${trello_list}`, foundListSuccess);
            
            // Fetch the board list
            window.Trello.get(
              `boards/${trello_board}/lists/`,
              foundListsSuccess
            );


          })
          
        } catch (e) {
          console.log(e);
        }

        found_card = window.Trello.get(
          `boards/${trello_board}/cards/?fields=name,shortUrl,comments,dateLastActivity,idList,labels,desc`,
          foundCardSuccess,
          foundCardFailure
        );

        if ($("#ads-container").length > 0) {
          $("#ads-container").remove();
        }

        if ($(".ad-banner").length > 0) {
          $(".ad-banner").remove();
        }
      }
    } else {
      if ($("#addToTrello").length > 0) {
      } else {
        if ($(".pv-s-profile-actions__label").text() == "Message") {
          if ($("#card-container").length > 0) {
            if (
              $("#card-container").attr("card_name") !==
              $(".pv-top-card-section__name").text()
            ) {
              window.location.reload();
            } else {
              //window.location.reload()
            }
          }
        }
      }
    }
  }, 1000);
});

var interval = null;

window.setInterval(function () {
  try {
    if ($(".button-primary-large").length) {
      $(".button-primary-large").each(function () {
        if ($(this).text().indexOf("Send now") !== -1) {
          console.log("Auto connected successfully");
          $(this).trigger("click");
        }
      });
    }
  } catch (e) {}
}, 500);

$(".search-results__total").prepend(massive_connect_btn);

$(document).on('click', '#massiveConnect', function () {
  $("#massiveConnect").text("Please wait ... Connecting");
  wait(500);
  scroll(0, 1000);

  i = 0;
  while (i < 4) {
    scroll(0, i * 1000);
    wait(500);
    $(".search-result__actions--primary").each(function () {
      if ($(this).text().indexOf("Connect") !== -1) {
        console.log("trigger autoconnect");
        $(this).trigger("click").css("background-color", "yellow");
        wait(500);
        //refreshPopupInterval = setInterval(function(){
        //try {
        $(".button-primary-large").each(function () {
          if ($(this).text().indexOf("Send now") !== -1) {
            console.log("Auto connected successfully");
            $(this).trigger("click");
          }
        });
        //}
        //catch(e) {

        //}
        //}, 500);
        $(this).css("background-color", "green");
        wait(500);
      }
    });
    i += 1;
  }

  $("#massiveConnect").text("All Connected");
});

$(".next-text").click(function () {
  $("#massiveConnect").text("Massive Connect");
});
