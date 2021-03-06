var Sticky = function(text, votes, id){
  this.text = $.trim(text);
  this.votes = votes;
  this.id = id;
};

Sticky.prototype.attachTo = function(sectionId){
  var thisSticky= this;

  var showLargeStickyDialog = function(addedPoint) {
    var colorOfSticky = addedPoint.parents('.section').attr('data-color');
    var uiDialog = $('#largeStickyDialog').parent('.ui-widget-content');
    uiDialog.removeClass(uiDialog.attr('class').split(/\s+/).pop())
      .addClass(colorOfSticky);

    $('#largeStickyDialog').find('.stickyText').val(addedPoint.find('.stickyText').text());
    $('#largeStickyDialog').find('.voteCountContainer .count').html(addedPoint.find('.voteCount .count').html());
    $('#largeStickyDialog').find('.removeStickyButton').unbind('click').click(
      function() {
        if(confirm("Do you want to delete this sticky?")){
          thisSticky.remove();
          $('#largeStickyDialog').dialog('close');
        }
      });
    $("#largeStickyDialog textarea").unbind('blur').blur(function(){
      thisSticky.edit($.trim($(this).val()));
    });
    $('#largeStickyDialog').find('.voteStickyButton').unbind('click').click(function(){thisSticky.upVote();});
    $('#largeStickyDialog').dialog('open');
  };

  var stickyTemplateHtml = $('#stickyTemplate').html();
  $(stickyTemplateHtml).appendTo('#section' + sectionId + ' .points');
  var addedPoint = $('#section' + sectionId).find('div.sticky:last');
  addedPoint.hide().attr('title', this.text)
    .attr('id', 'point' + this.id)
    .attr('data-id', this.id)
    .find('.stickyText').html(this.text);
  addedPoint.find('.voteCount .count').html(this.votes);
  addedPoint.click(function() {
      showLargeStickyDialog(addedPoint);
  });
  addedPoint.show('slow');
};

Sticky.prototype.getDom = function(){
  return $("#point" + this.id);
};

Sticky.prototype.updateDom = function(){
  this.getDom().find(".stickyText").html(this.text);
  this.getDom().find(".count").html(this.votes);
};

Sticky.prototype.upVote = function(){
  this.votes += 1;
  var thisSticky = this;
  $('#largeStickyDialog').find('.voteCountContainer').addClass("ajaxLoader");

  $.ajax({
    url: "/points/" + thisSticky.id + "/votes.json",
    type: "POST",
    data: {"vote": {"point_id": thisSticky.id }},
    success: function(result) {
      $('#largeStickyDialog').find('.count').html(thisSticky.votes);
      $('#largeStickyDialog').find('.voteCountContainer').removeClass("ajaxLoader");
      thisSticky.updateDom();
    },
    error: function(result) {
      alert('something went wrong. Please refresh the page');
    }
  });
};

Sticky.prototype.removeFromDom = function(){
  var thisSticky = this;
  this.getDom().hide('slow', function() {
    thisSticky.getDom().remove();
  });
};

Sticky.prototype.remove = function(){
  this.removeFromDom();
  $a.trackEvent('point', 'delete', $('#point' + this.id + " .stickyText").text());
  $.ajax({
    url: "/points/delete/" + this.id + ".json",
    type: "GET"
  });
};

Sticky.prototype.update = function(text,votes){
  this.text = $.trim(text);
  if(votes){
    this.votes = votes;
  }
  this.updateDom();
};

Sticky.prototype.edit = function(value) {
    this.update(value);
     $.ajax({
        url: '/points/' + this.id,
        type: 'PUT',
        data: {
            'point' :{
                'message': this.text
            }
        }
    });
};
