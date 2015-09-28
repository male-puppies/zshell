var oTabUsers,
	diagHideColumn,
	hideColumns = [],
	isFirstFilterURL = true, //只执行一次URL过滤
	oAPUsers;

//页面加载初始化
$(document).ready(function() {
	diagHideColumn = createDialogHideColumn();
	oTabUsers = createDtUsers();
	$("#tb_online_users_length").append('<input class="btn btn_col" style="margin-left:20px;" type="button" value="数据显示" />');
	initData();
	initEvent();
})

function createDialogHideColumn() {
	return $('#hide_column').dialog({
		"title": '显示隐藏列',
		"closed": true,
		"modal": true,
		"resizable": true,
		"width": 400,
		"height": 320,
		"buttons": [{
			text: '保存',
			handler: function() {
				saveHideColumn();
			}
		}, {
			text: '取消',
			handler: function() {
				$('#hide_column').dialog('close');
			}
		}]
	});
}

function saveHideColumn() {
	var str = {};
	var hidenum = [];
	$('#hide_column ul.ul_cols li').each(function(index, element) {
		if ($(element).find('input').attr("checked") != "checked") {
			hidenum.push($(element).find('input').val());
		}
	});
	str.page = 'webui/hidepage/wireless/onlineuser';
	str.data = hidenum;
	cgicall('RDS.DtHideColumns(%j)', str, function(d) {
		hideColumns = hidenum;
		$('#tb_online_users').oDtHideColumn(oTabUsers, hidenum);
	});
	diagHideColumn.dialog('close');
}

function createDtUsers() {
	return $('#tb_online_users').dataTable({
		"bAutoWidth": false,
		"bProcessing": false,
		"bSort": true,
		"sPaginationType":"full_numbers",
		"sServerMethod" : "POST",
		"sAjaxDataProp": "",
		"iDisplayLength": 10,
		"aoColumns": [
			{
				"mData":"id",
				"sWidth": 70
			},
			{
				"mData": "mac",
				"mRender": function(d, t, f) {
					return '<div class="fontwidth_family">'+ d +'</div>';
				}
			},
			{
				"mData": "band",
				"mRender": function(d, t, f) {
					return d.toUpperCase();
				}
			},
			{
				"mData": "dualband",
				"mRender": function(d, t, f) {
					return d == "1" ? "是" : "否";
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
					return '<a class="underline fontwidth_family" href="'+ urlFilterString +'apstatus?filter='+ f.ap +'">' + data + '</a><span style="display:none;">' + f.ap + '</span>';
				}
			},
			{
				"mData": "ssid",
				"sWidth": 180,
				"mRender": function(d, t, f){
					var rssi = parseInt(f['rssi']);
					var str = '(' + toSameNum(rssi, 4) +'dBm) ' + d;
					return '<span style="display:none;">'+rssi+ '</span>' + '<div class="rssi_blocks" value="'+ RssiConvert(rssi) +'" text="'+ str +'"></div>';
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
			/*
			{
				"mData":null,
				"bSortable": false,
				"sWidth": 60,
				"mRender": function(d, t, f){
					return '<input type="checkbox">';
				}
			}
			*/
		],
		"fnDrawCallback": function ( oSettings ) {   //用于生成table的序号;
			var that = this;
        	this.$('td:first-child', {}).each( function (i) {
                   that.fnUpdate( i+1, this.parentNode, 0, false, false );
			});
			//rssi bar
			$('.rssi_blocks').each(function(){
				var rssi = $(this).attr('value');
				var text = $(this).attr('text');
				$(this).progressbar({"value": rssi, "text": text});
				//fix color
				var color = RssiColor(rssi);
				$(this).find('.progressbar-value').css('background-color', color);
			});
       	},
		//"fnRowCallback":dtBindRowSelectEvents,
		"aaSorting": [[ 1, 'asc' ]]
	});
}

function initData(){	
	cgicall('RDS.ApmListUsers("")', function(d) {
		cgicall('RDS.GetHideColumns("webui/hidepage/wireless/onlineuser")', function(dd) { //获取隐藏的列
			cgicall('RDS.GetBandSupport("")', function(ddd) { //支持频段
				oAPUsers = d;
				if (!dd || dd == "false") {
					dd = hideColumns;
				} else {
					hideColumns = dd;
				}
				if (ddd == "2g" || ddd == "5g") {
					$("#hide_column ul li input").each(function(index, element) {
						if ($(element).attr("value") == "3") {
							$(element).parents("li").css("display", "none");
						}
					})
					var j = true;
					for (var i in dd) {
						if (dd[i] == "3") {
							j = false;
							break;
						}
					}
					if (j == true) dd.push("3");
				} else {
					$("#hide_column ul li").css("display", "block");
				}
				//过滤刷新
				dtReloadData(oTabUsers, ObjectToArray(d), true, function() {
					if ($('.dataTables_filter input').val() != '') {
						oTabUsers.fnFilter($('.dataTables_filter input').val());
					} else {
						if (isFirstFilterURL) {
							oTabUsers.fnFilter(GetRequestFilter());
							isFirstFilterURL = false;
						}
					}
				});
				$('#tb_online_users').oDtHideColumn(oTabUsers, dd);
				
				setTimeout(function(){
					initData();
				}, 5000);
			});
		});
	});
}

/*
function DoDelApUsers(){
	var aUsrs = dtGetSelected(oTabUsers);
	if (aUsrs.length == 0) {
		alert('选择要删除的行！')
		return;
	}
	var aUIDs = [];
	for (var i = aUsrs.length - 1; i >= 0; i--) {
		aUIDs.push({"ap": aUsrs[i].ap, "mac": aUsrs[i].mac, "band": aUsrs[i].band});
	};
	cgicall('RDS.ApmDelUsers(%j)', aUIDs, function(d){
		initData();
	});		
}

function OnSelectAll(){
	dtSelectAll(oTabUsers);
}
*/

function OnHideCol() {
	$("#hide_column ul li input").each(function(index, element) {
		$(element).attr('checked', true);
		for (var i=0; i<hideColumns.length; i++) {
			if (hideColumns[i] == $(element).val()) {
				$(element).attr('checked', false);
				break;
			}
		}
	})
	diagHideColumn.dialog('open');
}

function toSameNum(d, n) {
	var num,
		str = d.toString(),
		len = str.length;
	if (len < n) {
		num = parseInt(n) - len;
		for (var i = 0; i < num; i++) {
			str = ' ' + str;
		}
	}
	return str;
}

function initEvent(){
	//$('.delUsers').on('click', DoDelApUsers);
	//$('.checkall').on('click', OnSelectAll);
	$('.btn_col').live('click', OnHideCol);
}