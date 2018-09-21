$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    $("#articles").append(`<div class="card" style="width: 18rem;">
    <img class="card-img-top" src="${data[i].image}" alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title">${data[i].title}</h5>
      <p class="card-text">${data[i].summary}</p>
      <a href="${data[i].link}" class="btn btn-light">read</a>
      <a id="clickNote" data-id="${data[i]._id}" class="btn btn-light">create a note</a>
    </div>
    </div>`);
  }
});

$(document).on("click", "#clickNote", function() {
  
  $("#notes").empty();

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).then(function(data) {
    console.log(data);
    
    $("#notes").append(`<h2>${data.title}</h2>
      <input id='titleinput' name='title'>
      <textarea id='bodyinput' name='body'></textarea>
      <button data-id='${data._id}' id='savenote'>Save Note</button>`);

    if (data.note) {
      $("#titleinput").val(data.note.title);
      $("#bodyinput").val(data.note.body);
    }
  });
});

$(document).on("click", "#savenote", function() {
  
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  }).then(function(data) {
      console.log(data);
      $("#notes").empty();
    });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#clear", function() {

  $.ajax({
    method: "DELETE",
    url: "/articles/",
  });

  $("#articles").empty();
});

$(document).on("click", "#scrape", function() {

  $.ajax({
    method: "GET",
    url: "/scrape",
    success: function(html) {
      window.location.reload();
    }
  }).then(function(data) {
    res.json(data);
  });
});

