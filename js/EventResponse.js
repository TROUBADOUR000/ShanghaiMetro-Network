//添加边时的选择
load_lines(sh_subway.line_map.keys())
load_stations("#StationOne", sh_subway.vertex_map.keys())
load_stations("#StationTwo", sh_subway.vertex_map.keys())

//寻路时的选择
load_stations("#StartStation", sh_subway.vertex_map.keys())
load_stations("#EndStation", sh_subway.vertex_map.keys())


/*线路相关事件相应*/
$(document).ready(function () {
    // 定义添加线路
    $('#AddLineButton').click(function (e) {
        e.preventDefault();
        let id = $('#AddLineName').val()
        let color = $('#AddLineColor').val().slice(1);
        if (id == '') {
            // 输入为空
            let str = `<div class=\"alert alert-danger alert-dismissible fade show\">\
            <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
            <strong>添加失败！</strong>请输入线路名称</div>`
            $("#LinemessageBox").empty()
            $('#LinemessageBox').append(str)
        } else if (sh_subway.line_map.has(id)) {
            // 存在同名线路，那么提示重新插入线路
            let str = `<div class=\"alert alert-danger alert-dismissible fade show\">\
            <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
            <strong>添加失败！</strong>存在相同ID的线路</div>`
            $("#LinemessageBox").empty()
            $('#LinemessageBox').append(str)
        } else {
            sh_subway.add_line(id, id, color)
            // 插入新线路，新线路插入成功
            let str = `<div class=\"alert alert-success alert-dismissible fade show\">\
            <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
            <strong>添加成功！</strong>成功添加了${id}</div>`
            $("#LinemessageBox").empty()
            $('#LinemessageBox').append(str)
            load_lines(sh_subway.line_map.keys()) //添加后，更新选择线路框
        }
    });

    // 查看地铁线路表按钮点击事件
    $('#LineListButton').click(function (e) {
        e.preventDefault();
        $('#LineListModalBody').empty();
        str = `<div class="alert alert-primary" style="margin-bottom:0px" role="alert">
        ${sh_subway.get_line_list()}</div>`
        $('#LineListModalBody').append(str);
    });

});

/*连线相关事件相应*/
$(document).ready(function () {

    // 向地铁线路添加边表单提交事件响应
    $('#AddEdgeButton').click(function (e) {
        e.preventDefault();
        let key1 = $('#StationOne').val()
        let key2 = $('#StationTwo').val()
        if (key1 == key2) {
            // 输入的站点名称相同
            let str = `<div class=\"alert alert-danger alert-dismissible fade show\">\
            <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
            <strong>添加失败！</strong>输入的是同一个站点</div>`
            $("#EdgemessageBox").empty()
            $('#EdgemessageBox').append(str)
        } else if (!sh_subway.has_station(key1, key2)) {
            // 输入的站点不存在
            let str = `<div class=\"alert alert-danger alert-dismissible fade show\">\
            <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
            <strong>添加失败！</strong>输入的站点名不存在</div>`
            $("#EdgemessageBox").empty()
            $('#EdgemessageBox').append(str)
        } else {
            // 输入合法，更新数据结构，更新地图
            let line_id = $('#LineSelect').val();
            sh_subway.add_edge_to_line(key1, key2, line_id)
            draw_map() // 更新地图
            let str = `<div class=\"alert alert-success alert-dismissible fade show\">\
            <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
            <strong>添加成功！</strong>成功添加${key1}到${key2}的连线</div>`
            $("#EdgemessageBox").empty()
            $('#EdgemessageBox').append(str)
        }
    });

});

//重新加载上海铁路图
$(document).ready(function () {
    // 定义加载上海地图data点击事件
    $('#LoadButton').click(function (e) {
        e.preventDefault();
        sh_subway.clear() // 清空地图
        load_data() // 读取本地数据
        draw_map() // svg渲染图案
    });
})

/*节点相关事件响应*/
$(document).ready(function () {
    //添加站点按钮点击响应
    $('#AddNodeButton').click(function (e) {
        e.preventDefault();
        let lon = $('#AddLongtitude').val()
        let lat = $('#AddLatitude').val()
        let key = $('#AddNodeName').val()
        $("#NodemessageBox").empty()
        if (lon >= lon_range[0] && lon <= lon_range[1] && lat >= lat_range[0] && lat <= lat_range[1]) {
            let x, y
            [x, y] = millertoXY(lon, lat)
            if (sh_subway.add_node(key, x, y, [])) { // 添加成功，更新图片
                draw_map()
                let str = `<div class=\"alert alert-success alert-dismissible fade show\">\
                <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
                <strong>添加成功</strong>，添加了ID为${key}的站点</div>`
                $('#NodemessageBox').append(str)
                //寻路时的选择
                $("#StartStation").editableSelect('add', String(key));
                $("#EndStation").editableSelect('add', String(key));
                $("#StationOne").editableSelect('add', String(key));
                $("#StationTwo").editableSelect('add', String(key));
            } else { // 添加失败，ID存在相同的
                let str = `<div class=\"alert alert-danger alert-dismissible fade show\">\
                <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
                <strong>添加失败</strong>，已存在ID为${key}的站点。</div>`
                $('#NodemessageBox').append(str)
            }
        } else {  // 输入的数据不合法
            let str = `<div class=\"alert alert-danger alert-dismissible fade show\">\
            <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\
            <strong>添加失败</strong>，输入的经纬度不在规定范围内。</div>`
            $('#NodemessageBox').append(str)
        }
    });
});

/*寻路相关事件响应*/
$(document).ready(function () {

    $('#SearchRoad').click(function (e) {
        e.preventDefault();
        $('#Pathtitle').text('查询线路');
        let start = $('#StartStation').val();
        let end = $('#EndStation').val();

        if (sh_subway.has_station(start, end)) {
            var find = true;

            // 寻路成功
            if ($('#short_dis').is(':checked'))
                find = sh_subway.get_shortest_path(start, end);
            else
                find = sh_subway.get_least_transfer(start, end);

            let str = '';

            if (find === false) {
                str += `<div class="alert alert-danger" style="margin-bottom:0px" role="alert">
                    <strong>线路不存在</strong>无法从🚉站点${start}到达🚉站点${end}</div>`;
            } else {
                str += `<div class="alert alert-success" style="margin-bottom:0px" role="alert">
                    <strong>线路存在</strong>已在地图显示</div>`;

                draw_part_map(sh_subway.array);

                $('#Pathtitle').text('乘车指南');
                str += `<div class="alert alert-success" style="margin-bottom:0px" role="alert">
                    ${sh_subway.get_path_info(sh_subway.array)}</div>`;
            }

            $("#FindPathModalBody").empty();
            $('#FindPathModalBody').append(str);
        } else {
            // 输入的ID不存在数据结构中
            let str = `<div class="alert alert-danger" style="margin-bottom:0px" role="alert">不存在该输入的站点</div>`;
            $("#FindPathModalBody").empty();
            $('#FindPathModalBody').append(str);
        }
    });
});

