var oTable,
	modify_flag = 0, //0添加
	g_auth = {
		name: '',
		ip1: '',
		ip2: '',
		type: 'auto'
	};

$(document).ready(function() {
	oTable = createDtAuth();
	createDialog();
	initData();
	initEvent();
	verifyEventsInit();
});

function createDtAuth() {
	return $('#authn_strategy').dataTable({
		"bSort": false,
        "bAutoWidth": false,
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
		    {
				"mData": null,
				"sWidth": 80
			},
			{
				"mData": "name",
				"mRender": function(d, t, f) {
					return "<a href='javascript:;' class='edit' title='编辑' onclick='editAuthPolicy(this)'>"+ d +"</a>";
				}
			},
            {
				"mData": null,
			  	"mRender": function (d, t, f) {
					var str = '';
					if (f.ip1 != f.ip2) {
						str = f.ip1 + '-' + f.ip2;
					} else {
						str = f.ip1;
					}
           			return  str;
           		}
            },
            {
				"mData": "type",
            	"mRender": function (d, t, f) {
					if (d  ==  "web") {
						return 'Web认证';
					} else {
						return '自动认证';
					}
               	}
			},
            {
				"mData": "name",
				"mRender": function(d, t, f) {
					if (d == "default") {
						return "<span title='禁止移动默认策略' style='color:#999;cursor:default;text-decoration:none;'>禁止移动</span>"; //"禁止移动默认策略";  
					}
					return "<a style='margin-right: 8px;' href='javascript:;' class='up' onclick='rowMove(\"up\", \"" + f.name + "\")' title='上移'>上移</a><a href='javascript:;' class='down' onclick='rowMove(\"down\", \"" + f.name + "\")' title='下移'>下移</a>";  
				}
			},
            {
				"mData": "name",
				"sWidth": 80,
				"mRender": function(d, t, f) {
					if (d == "default") {
						return "<a style='color:#999;cursor:default;text-decoration:none;' class='del' title='禁止删除默认策略'>删除</a>"; 
					}
					return "<a href='javascript:;' class='del' onclick='delopt(\"" + d + "\")' title='删除策略'>删除</a>";
				}
			}
        ],
		"fnDrawCallback": function(oSetting) {
			this.api().column(0).nodes().each(function(cell, i) {
				cell.innerHTML = i + 1;
			});
			
			var aoData = oSetting.aoData;
			if (aoData.length > 0) {
				var firstRow = oTable.fnGetNodes(0);
				var pre_lastRow = oTable.fnGetNodes(aoData.length-2);
				$(firstRow).find('a.up').removeAttr('onclick').attr('title', '第一条,不能移动!').css({'cursor': 'default', 'color': '#999', 'text-decoration': 'none'});
				$(pre_lastRow).find('a.down').removeAttr('onclick').attr('title','不能移动到默认策略的位置!').css({'cursor': 'default', 'color': '#999', 'text-decoration': 'none'});
			};
		}   
	});
}

function createDialog() {
	$('#add_policy').dialog({
		"title": '认证方式配置',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
		"width": 560,
		"height": 420,
		"buttons": [
			{
				"text": "确定",
				"click": function() {
					setData();
				}
			},
			{
				"text": "取消",
				"click": function() {
					$(this).dialog("close");
				}
			}
		]
	});
}

function initData() {
	cgicall("PolicyGet", function(d) {
		if (d.status == 0) {
			dtReloadData(oTable, dtObjToArray(d.data));
		} else {
			console.log(d.data ? d.data : "reload fail");
		}
	})
}

function rowMove(set, name) {
	var data,
		num,
		forward,
		back,
		arr = [],
		obj = {};

	data = oTable.fnGetData();
	for (var i = 0; i < data.length; i++) {
		if (data[i].name == name) {
			num = i;
		}
		arr.push(data[i].name);
	}

	if (set == "up") {
		if (num == 0) {
			alert("第一条，不能移动！");
			return;
		}
		forward = arr[num];
		back = arr[num - 1];
		arr[num - 1] = forward;
		arr[num] = back;
	} else if (set == "down") {
		if (num == data.length - 1) {
			alert("禁止移动默认策略！");
			return;
		}
		if (num == data.length - 2) {
			alert("不能移动到默认策略的位置！");
			return;
		}
		forward = arr[num + 1];
		back = arr[num];
		arr[num] = forward;
		arr[num + 1] = back;
	}

	cgicall("PolicyAdj", arr, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("移动失败！" + (d.data ? d.data : ""));
		}
	})
}

function delopt(name){
	if (name  == 'default' ) {
		alert("无法删除默认策略!");
		return;
	}
	if (!confirm("确认要删除？")) return;
	var arr = [];
	arr.push(name);
	cgicall("PolicyDel", arr, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("删除失败！" + (d.data ? d.data : ""));
		}
	});
}

function setData(){
	if (!verification()) return;
	
	var data = jsonTraversal(g_auth, jsTravGet);
	var iprange = $('#iprange').val().split('-');
	if (iprange.length == 2) {
		data['ip1'] = iprange[0];
		data['ip2'] = iprange[1];
	} else {
		data['ip1'] = iprange[0];
		data['ip2'] = iprange[0];
	}

	if (modify_flag == 0) {//add
		if ($("#name").val() == "default") {
			alert("不能以 default 命名！")
			return;
		}
		cgicall("PolicyAdd", data, function(d) {
			if (d.status == 0) {
				initData();
				$("#add_policy").dialog("close");
			} else {
				alert("添加失败！" + (d.data ? d.data : ""));
			}
		});
	} else {
		if ($("#name").val() == "default") return;
		cgicall("PolicySet", data, function(d) {
			if (d.status == 0) {
				initData();
				$("#add_policy").dialog("close");
			} else {
				alert("修改失败！" + (d.data ? d.data : ""));
			}
		});
	}
}

function editAuthPolicy(that) {
	var node,
		obj = {},
		iprange;

	modify_flag = 1;
	$('#name').prop("disabled", true);
	
	node = $(that).closest("tr");
	obj = oTable.fnGetData(node);
	if (obj.name == "default") {
		$('#iprange,input:radio[name="type"]').prop("disabled", true);
	} else {
		$('#iprange,input:radio[name="type"]').prop("disabled", false);
	}

	jsonTraversal(obj, jsTravSet);
	iprange = obj.ip1 + '-' + obj.ip2;
	$("#iprange").val(iprange);
	$('#add_policy').dialog('open');
}

function initEvent() {
	$('.add').on('click', OnAddAuth);
	$("#add_policy").tooltip();
}

function OnAddAuth() {
	modify_flag = 0;
	$('#name').prop("disabled", false);
	$('#iprange,input:radio[name="type"]').prop("disabled", false);
	$('#add_policy').dialog('open');
}
