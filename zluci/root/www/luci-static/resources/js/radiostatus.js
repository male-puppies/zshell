var oTabRadio,
	oTabNeighbor,
	oTabWlanstate,
	hideColumns = ["6","8"],
	isFirstFilterURL = true, //只执行一次URL过滤
	wlanStateID = {};
	
//页面加载初始化
$(document).ready(function() {
	oTabRadio = createDtRadios();
	oTabNeighbor = createDtNeighbor();
	oTabWlanstate = createDtWlanstate();
	initCreateDialog();
	initData();
	initEvent();
})

function createDtRadios() {
	return $('#Radio_list').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[1, 'asc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
			{
				"mData": null,
				"sWidth": 80
			},
			{
				"mData": "prototol"
			},
			{
				"mData": "band",
				"mRender": function(d, t, f) {
					return d.toUpperCase();
				}
			},
			{
				"mData": "channel_id"
			},
			{
				"mData": "bandwidth"
			},
			{
				"mData": "user_num",
				"mRender": function(d, t, f) {
					return '<a style="padding:0 5px;" class="underline" href="onlineuser?filter='+ f.ap +'">' + toSameNum(d, 2) + '</a>';
				}
			},
			{
				"mData": "power"
			},
			{
				"mData": "channel_use",
				"mRender": function(d, t, f) {
					return toSameNum(d, 3) + '%';
				}
			},
			{
				"mData": "noise"
			},
			{
				"mData": "ap_describe",
				"mRender": function(d, t, f) {
					var data = d;
					if (data == "default" || data == "") data = f.ap;
					return '<a class="underline" href="apstatus?filter='+ f.ap +'">' + data + '</a><span style="display:none;">' + f.ap + '</span>';
				}
			},
			{
				"mData": "wlanstate",
				"mRender": function(d, t, f) {
					return '<a style="padding:0 5px;" href="javascript:;" onclick="openWlanstate(\'' + f.band + '\',\'' + f.ap + '\')">' + toSameNum(d, 3) + '</a>';
				}
			},
			{
				"mData": "nwlan",
				"mRender": function(d, t, f) {
					return '<a style="padding:0 5px;" href="javascript:;" onclick="openNeighbor(\'' + f.band + '\',\'' + f.ap + '\')">' + toSameNum(d, 3) + '</a>';
				}
			}
		],
		"fnDrawCallback": function() {
			this.api().column(0).nodes().each(function(cell, i) {
				cell.innerHTML = i + 1;
			});
		}
	});
}

function createDtNeighbor() {
	return $('#neighbor_list').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[3, 'desc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
			{
				"mData": "ssid"
			},
			{
				"mData": "bssid"
			},
			{
				"mData": "channel_id"
			},
			{
				"mData": "rssi",
				"sWidth": 180,
				"mRender": function(d, t, f){
					return '<span style="display:none;">'+ toSameNum(d, 4) + '</span>' + '<div class="rssi_blocks" value="'+ d +'"><div class="rssi_tip"></div></div>';
				}
			}
		],
		"fnDrawCallback": function() {
			$('.rssi_blocks').each(function(index, element) {
				var val = $(element).attr('value');
				var rssi = RssiConvert(val);
				$(element).progressbar({
					"value": rssi
				});
				$(element).find(".rssi_tip").text(val +' dBm');
				$(element).find('.ui-progressbar-value').css('background-color', RssiColor(rssi));
			});
			
		}
	});
}

function createDtWlanstate() {
	return $('#wlanstate_list').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[3, 'asc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
			{
				"mData": "ath"
			},
			{
				"mData": "essid"
			},
			{
				"mData": "bssid",
				"mRender": function(d, t, f) {
					if ("bssid" in f) {
						return d;
					} else {
						return "";
					}
				}
			},
			{
				"mData": "rate",
				"mRender": function(d) {
					return toSameNum(d, 4) + 'Mb/s';
				}
			},
			{
				"mData": "users",
				"mRender": function(d, t, f){
					return '<a style="padding:0 5px;color:#C00;text-decoration:underline;" href="onlineuser?filter=' + wlanStateID.apid + '||' + f.essid + '||' + wlanStateID.band +'">' + toSameNum(d, 3) + '</a>';
				}
			}
		]
	});
}

function initCreateDialog() {
	$('#hide_column').dialog({
		"title": '显示隐藏列',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
		"width": 480,
		"height": 360,
		"buttons": [
			{
				"text": '保存',
				"click": function() {
					saveHideColumn();
					$(this).dialog('close');
				}
			},
			{
				"text": '取消',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
	
	$('#dialog_neighbor').dialog({
		"title": '相邻WLAN',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
		"width": 640,
		"height": 460,
		"buttons": [
			{
				"text": '关闭',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
	
	$('#dialog_wlanstate').dialog({
		"title": 'WLAN状态',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
		"width": 640,
		"height": 460,
		"buttons": [
			{
				"text": '关闭',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
}

function initData() {
	cgicall('RadioList', function(d) {
		cgicall("GetHideColumns", "webui/hidepage/wireless/radiostatus", function(hd) {
			if (d.status == 0) {
				var data = d.data,
					harr = hideColumns;

				if (hd.status == 0) {
					if (Object.prototype.toString.call(hd.data) === '[object Array]') {
						hideColumns = hd.data;
						harr = hd.data;
					}
				}
				
				dtReloadData(oTabRadio, dtObjToArray(data), true, function() {
					var furl = getRequestFilter();

					if (furl != "" && isFirstFilterURL) {
						oTabRadio.fnFilter(furl);
						isFirstFilterURL = false;
					}
					dtHideColumn(oTabRadio, harr);
				});
				setTimeout(function(){
					initData();
				}, 10000);
			} else {
				console.log("RadioList error " + (d.data ? d.data : ""));
			}
		});
	});
}

function getRequestFilter() {
	var str,
		restr = "",
		obj = {},
		url = window.location.search;
		
	if (url && url != "") {
		url = url.substring(1);
		str = url.split("&");
		
		for (var i = 0; i < str.length; i ++) {
			obj[str[i].split("=")[0]] = str[i].split("=")[1];
		}
		
		if ("filter" in obj) {
			restr = obj.filter.split("||").join(" ");
		}
	}
	return decodeURI(restr);
}

function saveHideColumn() {
	var obj = {};
	var hidenum = [];
	$('#hide_column ul.ul_cols li').each(function(index, element) {
		if (!$(element).find('input').is(":checked")) {
			hidenum.push($(element).find('input').val());
		}
	});
	obj.page = 'webui/hidepage/wireless/radiostatus';
	obj.data = hidenum;
	cgicall('DtHideColumns', obj, function(d) {
		if (d.status == 0) {
			hideColumns = hidenum;
			dtHideColumn(oTabRadio, hidenum);
		} else {
			alert("操作失败！" + (d.data ? d.data : ""));
		}
	})
}

function openNeighbor(g, ap) {
	var obj = {
		"band": g,
		"apid": ap
	}

	cgicall('NWLAN', obj, function(d) {
		if (d.status == 0) {
			dtReloadData(oTabNeighbor, dtObjToArray(d.data));
		} else {
			console.log("open neighbor fail" + (d.data ? d.data : ""));
		}
		
		$("#dialog_neighbor").dialog('open');
	});
}

function openWlanstate(g, ap) {
	wlanStateID.band = g;
	wlanStateID.apid = ap;
	cgicall('WLANState', wlanStateID, function(d) {
		if (d.status == 0) {
			console.log(dtObjToArray(d.data))
			dtReloadData(oTabWlanstate, dtObjToArray(d.data));
		} else {
			console.log("open wlanstate fail" + (d.data ? d.data : ""));
		}
		$("#dialog_wlanstate").dialog('open');
	});
}

function initEvent(){
	$('.btn_col').on('click', OnHideCol);
}


function OnHideCol() {
	$("#hide_column ul li input").each(function(index, element) {
		$(element).prop('checked', true);
		for (var i = 0; i < hideColumns.length; i++) {
			if (hideColumns[i] == $(element).val()) {
				$(element).prop('checked', false);
				break;
			}
		}
	})
	$("#hide_column").dialog('open');
}

function RssiConvert(d) {
	var num = parseInt(d);
	var per = Math.round((100*num + 11000)/75); //-30信号强度为100%,-110为0%
	if (per < 0) per = 0;
	if (per > 100) per = 100;
	return per;
}

function RssiColor(sRate) {
	var r = 0,
		g = 0,
		b = 0,
		rate = parseInt(sRate);

	b = (100 - rate) * 155 / 100 + 100;
	r = (100 - rate) * 155 / 100 + 100;
	g = rate * 100 / 100 + 200;

	return 'rgb(' + parseInt(r) + ', ' + parseInt(g) + ', ' + parseInt(b) + ')';
}
