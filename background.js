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

console.log("Plurico background loaded.");

// clear data created by previous version
if (!localStorage["Plurico_version"]) {
  console.log("clear all data created by previous version");
  localStorage.clear();
  localStorage["Plurico_version"] = "0.1.2.1";
}

// response when requested
chrome.extension.onRequest.addListener( 
  function(request, sender, sendResponse) {
    var video_url = request.video_url;
    var video_id = video_url.substring(video_url.indexOf("/watch/")+7);
    var thumbnail_url = "";
    var title = "";
    var embed = "";
    console.log(sender.tab ? "from a content script: " + sender.tab.url : "from the extension");
    console.log("request.video_url = " + request.video_url + ", video_id = " + video_id);
    chrome.pageAction.show(sender.tab.id);

    if (localStorage[video_id]) {
      // load from localStorage
      var video_thumbinfo = JSON.parse(localStorage[video_id]);
      video_id = video_thumbinfo["video_id"];
      title = video_thumbinfo["title"]
      thumbnail_url = video_thumbinfo["thumbnail_url"];
      console.log(video_id + ": found in localStorage.");
    } else {
      // get thumbinfo from nico
      $.get("http://ext.nicovideo.jp/api/getthumbinfo/" + video_id, function(data) {
        video_id = $(data).find("video_id").text();
        title = $(data).find("title").text();
        thumbnail_url = $(data).find("thumbnail_url").text();
        console.log(video_id + ": got from Nico. thumbnail_url = " + thumbnail_url + ", title = " + title);

        // save to localStorage
        localStorage[video_id] = JSON.stringify({
          "video_id": video_id,
	  "title": title,
	  "thumbnail_url": thumbnail_url
        });
      }, "xml");
    }
    // execute js to get embeded player
    $.getScript("http://ext.nicovideo.jp/thumb_watch/" + video_id, function() {
      // remove it from background.html and provide it to content.js
      embed = $("embed:last, p:last").remove().fullhtml();
      sendResponse({"video_id": video_id, "title": title, "thumbnail_url": thumbnail_url, "embed": embed });
    });
  });
