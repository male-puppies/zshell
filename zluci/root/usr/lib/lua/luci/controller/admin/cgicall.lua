local socket = require("socket")
local struct = require("struct")
local js = require("cjson")
local log = require("luci.log")
module("luci.controller.admin.cgicall", package.seeall)

function index()
	entry({"admin", "cgicall"}).index = true
	entry({"admin", "cgicall"}, call("action_cgi")).leaf = true
end

function action_cgi()
	local map = luci.http.formvalue()

	local cmd, data = map.cmd, map.data or ""
	if not cmd then
		luci.http.write_json({state=1,msg="post fail"})
		return
	end

	local sock = socket.connect("127.0.0.1", 9997)
	if not sock then
		luci.http.write_json({state=1,msg="connect fail"})
		return
	end
	
	local s = js.encode({cmd, data})
	sock:send(strucct.pack("<I", #s) .. s)

	local chunk = sock:receive(4)
	if not chunk then 
		luci.http.write_json({state=1,msg="receive pack fail"})
		sock:close()
		return 
	end

	local data = sock:receive(strucct.unpack("<I", chunk))
	if not data then 
		luci.http.write_json({state=1,msg="receive fail"})
		sock:close()
		return 
	end

	sock:close()

	luci.http.header("Content-Length", #data)
	luci.http.write(data)
end
	