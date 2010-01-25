/*
 * This file is part of Plurico.
 *
 * Plurico: A simple Chrome extension to view Nico videos inside Plurk
 * Copyright (C) 2010  Chun-wei Kuo <http://www.cdpa.nsysu.edu.tw/~domon/>
 *
 * Plurico is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Plurico is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Plurico.  If not, see <http://www.gnu.org/licenses/>.
 */

$(function(){

// start processing when mouseover on any div.text_holder
$("#timeline_holder").listen("mouseover", "div.text_holder", function(){
  console.log("mouseover detected");
  // get unprocessed nico links
  $("div.text_holder > a.ex_link:not(.video)[href*='nicovideo.jp/watch/']").each(function(index, nico_link) {
    var video_url = $(nico_link).attr("href");
    // send message, get response that contains thumbinfo
    chrome.extension.sendRequest({"video_url": video_url}, function(response) {
      var thumbnail_url = response.thumbnail_url;
      var title = response.title;
      var video_id = response.video_id;
      var embed = response.embed;
      console.log(video_id + ": thumbnail_url = " + thumbnail_url + " , title = " + title);
      // process the current nico link
      $(nico_link).addClass("nico video").mouseover(function() {
        // prepare a mouseover tooltip
        if ($(".tooltip_cnt").length === 0) {
	  $("div.AmiTT_main.AmiTT_left").append($('<div class="tooltip_cnt"></div>'));
	}
        var pos = $(this).offset();
        $(".tooltip_cnt").html(title).parent().css({"left": pos.left - 5, "top": pos.top + 35, "display": "inline"});
      }).mouseout(function() {
        $(".tooltip_cnt").parent().css("display", "none");
      }).click(function() {
        // prepare dialog
	if ($('#dialog-' + video_id).length === 0) {
	  $("body").append($('<div id="dialog-' + video_id + '"></div>'));
	}
	$('#dialog-' + video_id).attr("title", title).html(
	  embed +'<p class="direct_link">Direct link: <a href="'+video_url+'" target="_blank">'+video_url+'</a></p>'
        );
	$('#dialog-' + video_id).dialog({
          autoOpen: false,
	  width: 522,
	  height:478
	});
        $('#dialog-' + video_id).dialog("open");
        return false;
      }).html('<img src="'+ thumbnail_url +'" alt="" width="40" height="30">');
    });
  });
});

});
