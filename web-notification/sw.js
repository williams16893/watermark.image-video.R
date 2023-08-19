/**
 * Web Notification
 *
 * Auth: ligz#wondershare.cn
 * Date: 17:12 2019/6/25
 * Copyright: Wondershare Inc.
 */

(function() {

    'use strict';

    var
        pushContent,
        afterCloseCallback,
        gtmReportObj = {
            gidckv: "",
            gackv: "",
            location: "",
            path: "",
            GTM_ID_SUFFIX: "WPNBJKV",
            EVENT: "DC_WGP_Message",
            TID: "UA-4839360-64"
        },
        sensorsProject = 'UA_CscOperation_Web'; // 上线要改为UA_CscOperation_Web

    function logConsoleError(message) {
        // needed to write it this way for jslint
        var consoleType = typeof console;
        if (consoleType !== 'undefined' && console && console.error) {
            console.error(message);
        }
    }

    function parseJSON(text) {
        var data = {};
        if ('string' === typeof text) {
            try {
                data = JSON.parse(text);
                if ('object' !== typeof data) {
                    data = {};
                }
            } catch (e) {
                logConsoleError(e);
            }
        } else if ('object' === typeof text) {
            data = text;
        }

        return data;
    }

    // 生成唯一ID
    function uuid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }

    function buildParamsObj2String(eventAction, buttonText) {
        var paramsObj = {
            v: 1,
            _v: "j87",
            a: uuid(),
            t: "event",
            ni: 0,
            ds: "web_GTM-" + gtmReportObj.GTM_ID_SUFFIX + "_15",
            _s: 1,
            dl: gtmReportObj.location || "",
            dp: gtmReportObj.path || "",
            ul: "zh-cn",
            de: "UTF-8",
            sd: "24-bit",
            je: 0,
            ec: gtmReportObj.EVENT,
            ea: eventAction,
            el: "___", // $messageId___UA-WGP-System___$uid___$pid___$pver___web_notification___$track_id
            _u: "SCCAAEALAAAAAC~",
            jid: uuid(),
            gjid: uuid(),
            cid: gtmReportObj.gackv || "1465743785.1608088318",
            tid: gtmReportObj.TID,
            _r: 1,
            gtm: "2wgbu0" + gtmReportObj.GTM_ID_SUFFIX,
            cd2: gtmReportObj.gackv || "1465743785.1608088318",
            cd3: new Date().getTime(), // hitTimeStamp
            z: uuid(),
        };
        if (pushContent && pushContent.id) {
            // console.log('pushContent', pushContent);
            var id = pushContent.id;
            var messageId = id.split("-")[1];
            var statPoint = pushContent.stat_point;
            var uid = pushContent.wsid || "null";
            var pid = statPoint.pid || "null";
            var pver = statPoint.pver || "null";
            var track_id = statPoint.track_id;
            var operation_id = statPoint.operation_id;
            var label = messageId + "___UA-WGP-System___" + uid + "___" + pid + "___" + pver + "___web_notification___" + track_id + "___" + operation_id;
            if (eventAction === "wgp_page_click") {
                label = label + "___" + buttonText;
            }
            paramsObj.el = label;
            if (pushContent.data && pushContent.data.gaid && gtmReportObj.gackv === '') {
                var gaCookieValue = pushContent.data.gaid;
                paramsObj.cid = gaCookieValue;
                paramsObj.cd2 = gaCookieValue;
            }
        }
        var res = "";
        for (var key in paramsObj) {
            res += (key + '=' + paramsObj[key] + '&');
        }
        if (res.endsWith('&')) {
            var len = res.length;
            res = res.substring(0, len - 1);
        }
        // console.log('buildParamsObj2String res', res);
        return res;
    }

    function buildSensorsRequestUrl(dataObj) {
        var res = 'https://prod-web.wondershare.cc/api/v1/email-report?';
        for (var key in dataObj) {
            res += key + '=' + dataObj[key] + '&';
        }
        if (res.endsWith('&')) {
            var len = res.length;
            res = res.substring(0, len - 1);
        }
        return res;
    }

    // 上报神策数据
    function reportSensorsData(data) { // data其实应该取pushContent的字段，即notification推送携带的信息
        // https://prod-web.wondershare.cc/api/v1/email-report?project=UA_CscOperation_Web_test&type=track&event=recall_page_view&psource=email&distinct_id=551924004&operation_id=20211111_0_1_5&sku_id=20022&uid=551924004&pid=10789/10726/10788/3223&pver=&track_id=ef4bfcf0-42d3-11ec-b2f6-6c4b90e5cbb2
        var fetchUrl = buildSensorsRequestUrl({
            project: sensorsProject,
            type: 'track',
            event: data.event,
            psource: 'web_notification',
            distinct_id: data.distinct_id,
            operation_id: data.operation_id,
            sku_id: data.sku_id,
            uid: data.uid,
            pid: data.pid,
            pver: data.pver,
            track_id: data.track_id,
        });
        fetch(fetchUrl, {
                method: 'GET'
            })
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log('error', error));
    }

    function sendGTMRequest(eventAction, buttonText) {
        if ('function' !== typeof fetch || 'function' !== typeof Headers) {
            return false;
        }
        var myHeaders = new Headers();
        myHeaders.append("accept", " */*");
        myHeaders.append("accept-encoding", " gzip, deflate, br");
        myHeaders.append("accept-language", " zh-CN,zh;q=0.9,en;q=0.8");
        myHeaders.append("cache-control", " no-cache");
        myHeaders.append("content-length", " 0");
        myHeaders.append("content-type", " text/plain");
        myHeaders.append("pragma", " no-cache");
        myHeaders.append("sec-fetch-dest", " empty");
        myHeaders.append("sec-fetch-mode", " no-cors");
        myHeaders.append("sec-fetch-site", " cross-site");

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: "",
            mode: 'no-cors',
        };

        var params = buildParamsObj2String(eventAction, buttonText);

        fetch("https://www.google-analytics.com/j/collect?" + params, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));

    }

    function pushEventCallback(event) {
        // console.log('[Service Worker] Push Received.');
        // console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

        var data = parseJSON(event.data.text());

        if (!data || !data.id || !data.title || !data.body) {
            return;
        }

        pushContent = data;
        afterCloseCallback = null;

        sendGTMRequest("wgp_page_view");
        // 只有sku_id有值，才需要上报神策
        if (pushContent && pushContent.stat_point && pushContent.stat_point.sku_id) {
            var statPoint = pushContent.stat_point;
            reportSensorsData({
                event: "recall_page_view",
                distinct_id: statPoint.distinct_id,
                operation_id: statPoint.operation_id,
                sku_id: statPoint.sku_id,
                uid: pushContent.wsid,
                pid: statPoint.pid,
                pver: statPoint.pver || "",
                track_id: statPoint.track_id,
            });
        }

        var title = data.title,
            options = {
                body: data.body
            };
        if (data.icon) {
            options.icon = data.icon;
        }
        if (data.badge) {
            options.badge = data.badge;
        }
        if (data.requireInteraction) {
            options.requireInteraction = data.requireInteraction;
        }
        if (data.image) {
            options.image = data.image;
        }
        if (data.actions) {
            options.actions = data.actions;
        }
        if (data.data) {
            options.data = data.data;
        }
        if (data.dir) {
            options.dir = data.dir;
        }
        if (data.tag) {
            options.tag = data.tag;
        }

        var notificationPromise = self.registration.showNotification(title, options);
        event.waitUntil(notificationPromise);
    }

    function clickEventCallback(event) {
        // console.log('[Service Worker] Notification click Received.');
        // console.log('pushContent', pushContent);
        // console.log('clickEventCallback event', event);

        event.notification.close();

        var jumpUrl = event.notification.data.link;
        switch (event.action) {
            case 'coffee':
                jumpUrl = event.notification.data.coffee;
                break;
            case 'doughnut':
                jumpUrl = event.notification.data.doughnut;
                break;
            case 'gramophone':
                jumpUrl = event.notification.data.gramophone;
                break;
            case 'atom':
                jumpUrl = event.notification.data.atom;
                break;
            default:
                break;
        }

        if (jumpUrl && /^https?:\/\//.test(jumpUrl)) {
            afterCloseCallback = function() {
                clients.openWindow(jumpUrl);
            };
        }

        event.waitUntil(
            // 1、上报用户点击通知事件
            // 2、处理通知打开活动页面事件；
            clickRequest(afterCloseCallback, event)
        );

    }

    /**
     *
     * 是否为数组
     * @param {*} target
     * @return {*}
     */
    function isArrayEle(target) {
        var res = false;
        if (target && Array.isArray(target) && target.length > 0) {
            res = true;
        }
        return res;
    }

    /**
     *
     * 获取当前点击事件按钮文案
     * @param {*} event
     * @return {*}
     */
    function getCurrentClickItemText(event) {
        var buttonText = "";
        var notificationActions = event.notification.actions;
        var currentAction = event.action;
        if (isArrayEle(notificationActions)) {
            var findItems = notificationActions.filter(function(item) {
                return item.action === currentAction;
            });
            if (isArrayEle(findItems)) {
                buttonText = findItems[0].title;
            }
        }
        return buttonText;
    }

    function clickRequest(callback, event) {
        var buttonText = getCurrentClickItemText(event);
        sendGTMRequest("wgp_page_click", buttonText);
        // 只有sku_id有值，才需要上报神策
        if (pushContent && pushContent.stat_point && pushContent.stat_point.sku_id) {
            var statPoint = pushContent.stat_point
            reportSensorsData({
                event: 'recall_page_click',
                distinct_id: statPoint.distinct_id,
                operation_id: statPoint.operation_id,
                sku_id: statPoint.sku_id,
                uid: pushContent.wsid,
                pid: statPoint.pid,
                pver: statPoint.pver || '',
                track_id: statPoint.track_id
            });
        }
        if ('function' === typeof callback) {
            callback();
        }
    }

    function closeEventCallback() {
        sendGTMRequest("wgp_page_close");
    }

    self.addEventListener('push', pushEventCallback);
    self.addEventListener('notificationclick', clickEventCallback);
    self.addEventListener('notificationclose', closeEventCallback);

})();