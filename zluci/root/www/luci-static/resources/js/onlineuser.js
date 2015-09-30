var oTabUsers,
	isFirstFilterURL = true; //只执行一次URL过滤

//页面加载初始化
$(document).ready(function() {
	oTabUsers = createDtUsers();
	initData();
	initEvent();
})


function createDtUsers() {
	return $('#tb_online_users').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[1, 'desc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
			{
				"mData": null
			},
			{
				"mData": "mac"
			},
			{
				"mData": "band",
				"mRender": function(d, t, f) {
					return d.toUpperCase();
				}
			},
			{ 
				"mData": "ip",
				"mRender": function(d, t, f){
					return d == "" ? "waiting..." : d;
				}
			},
			{
				"mData": "ap_describe",
				"mRender": function(d, t, f) {
					var data = d;
					if (data == "default" || data == "") data = f.ap;
					return '<span style="display:none;">' + f.ap + '</span><a class="underline" href="apstatus?filter='+ f.ap +'">' + data + '</a>';
				}
			},
			{
				"mData": "ssid",
				"sWidth": 180,
				"mRender": function(d, t, f){
					var rssi = parseInt(f['rssi']);
					var str = '(' + toSameNum(rssi, 4) + 'dBm) ' + d;
					return '<span style="display:none;">' + toSameNum(rssi, 4) + '</span>' + '<div class="rssi_blocks" value="' + RssiConvert(rssi) + '" text="' + str + '"><div class="rssi_tip"></div></div>';
				}
			},
			{ 
				"mData": "status",
				"mRender": function(d, t, f){
					var str = '<span style="color: ';
					if (d == "1") {
						str += 'green;"> 在线';
					}else {
						str += 'red;"> 离线';
					}
					return str + '</span>';
				}
			}
		],
		"fnDrawCallback": function() {
			this.api().column(0).nodes().each(function(cell, i) {
				cell.innerHTML = i + 1;
			});
			
			$('.rssi_blocks').each(function(index, element) {
				var val = $(element).attr('value'),
					text = $(element).attr('text');

				$(element).progressbar({"value": parseInt(val)});
				$(element).find(".rssi_tip").text(text);
				$(element).find('.ui-progressbar-value').css('background-color', RssiColor(val));
			});
		}
	});
}

function initData(){	
	cgicall('ApmListUsers', function(d) {
		if (d.status == 0) {
			dtReloadData(oTabUsers, dtObjToArray(d.data), true, function() {
				var furl = getRequestFilter();

				if (furl != "" && isFirstFilterURL) {
					oTabUsers.fnFilter(furl);
					isFirstFilterURL = false;
				}
			});
			
			setTimeout(function(){
				initData();
			}, 5000);
		} else {
			console.log("ApmListUsers error " + (d.data ? d.data : ""));
		}
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

	b = (100 - rate) * 120 / 100 + 100;
	r = (100 - rate) * 120 / 100 + 100;
	g = rate * 100 / 100 + 200;

	return 'rgb(' + parseInt(r) + ', ' + parseInt(g) + ', ' + parseInt(b) + ')';
}

