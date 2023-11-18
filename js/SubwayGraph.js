class Line {
    constructor(line_id, name, color) {
        this.name = name   //线路的名字
        this.id = line_id  //线路的id
        this.color = color //颜色的十六进制表示
    }
}

//站点的数据结构
class Vertex {
    constructor(key, x, y, pass_line, float_x, float_y) {
        this.id = key                           //站点的id
        this.x = parseInt(x)                    //站点的x坐标
        this.y = parseInt(y)                    //站点的y坐标
        this.pass_line = new Set(pass_line)      //经过该站点的所有线路
        this.float_x = float_x                  //站点字体在x方向上偏离圆心的位置
        this.float_y = float_y                  //站点字体在y方向上偏离圆心的位置
        this.map = new Map([])                  //与该站点相连的站点
    }

    add_edge(key, dis) {
        this.map.set(key, dis)
    }
}

//地铁图的数据结构
class subwayGraph {
    constructor() {
        this.line_map = new Map()       //存储所有线路
        this.vertex_map = new Map()    //存储所有站点
        this.vertex_num = 0            //站点数量
        this.array = []                  //求最短路径时的临时数组
    }

    //清空整个graph
    clear() {
        this.line_map.clear()
        this.vertex_map.clear()
        this.vertex_num = 0;
    }

    // 添加一个节点
    add_node(key, x, y, pass_line, float_x = 2, float_y = 4) {
        if (this.vertex_map.has(key)) {
            return false
        } // 同名节点已存在，无法添加
        let new_node = new Vertex(key, x, y, pass_line, float_x, float_y)
        this.vertex_map.set(key, new_node)
        this.vertex_num += 1
        return true
    }

    // 添加一条边
    add_edge(key1, key2) {
        let [x1, y1] = [this.vertex_map.get(key1).x, this.vertex_map.get(key1).y]
        let [x2, y2] = [this.vertex_map.get(key2).x, this.vertex_map.get(key2).y]
        let dis = ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** (1 / 2)
        this.vertex_map.get(key1).add_edge(key2, dis)
        this.vertex_map.get(key2).add_edge(key1, dis)
    }

    // 添加一条地铁线路
    add_line(line_id, line_name, line_color) {
        if (this.line_map.has(line_id)) {
            return false
        }
        let new_line = new Line(line_id, line_name, line_color)
        this.line_map.set(line_id, new_line)
        return true
    }

    // 向指定的地铁线路添加一条边
    add_edge_to_line(key1, key2, line_id) {
        if (this.vertex_map.has(key1) == false || this.vertex_map.has(key2) == false) { // 输入的节点不存在
            return false
        }
        this.add_edge(key1, key2) // 添加边关系
        this.vertex_map.get(key1).pass_line.add(line_id)
        this.vertex_map.get(key2).pass_line.add(line_id)
        return true
    }

    // 获得对应线路id的总站数
    get_station_count(line_id) {
        let count = 0
        for (let station of this.vertex_map.values()) {
            count += station.pass_line.has(line_id)
        }
        return count
    }

    // 获得两个点之间的边的颜色
    get_vertex_color(key1, key2) {
        if (this.vertex_map.get(key1).map.has(key2) == false) {
            console.log("alert,wrong message!,There is no vertex between ", key1, "and", key2)
            return false;
        } else {
            let a = this.vertex_map.get(key1).pass_line
            let b = this.vertex_map.get(key2).pass_line
            let line = new Set([...a].filter(x => b.has(x)))
            let color = new Set()
            for (let item of line) {
                color.add(this.line_map.get(item).color)
            }
            return color
        }
    }

    // 获得两个点之间边经过的线路的名称
    get_common_lines(key1, key2) {
        let a = this.vertex_map.get(key1).pass_line
        let b = this.vertex_map.get(key2).pass_line
        let line = new Set([...a].filter(x => b.has(x)))
        let name = new Set()
        for (let item of line) {
            if (this.line_map.has(item)) {
                name.add(this.line_map.get(item).name)
            }
        }
        return name
    }

    //判断是否存在这两个站点
    has_station(key1, key2) {
        if (this.vertex_map.has(String(key1)) && this.vertex_map.has(String(key2))) {
            return true
        }
        return false
    }

    // 实现返回线路列表
    get_line_list() {
        let res = ''
        for (let line of this.line_map.values()) {
            res += `<div style="display: inline-block;">🚉${line.id},总共${this.get_station_count(line.id)}站
               颜色:</div><div style="width:15px;height:15px;background-color:#${line.color};
               display: inline-block;"></div>
               <br/>`
        }
        return res
    }

    // 实现返回换乘指南的字符串
    get_path_info(array) {
        let len = array.length
        let res = `<strong>${array[0]}->${array[len - 1]}换乘指南:</strong><br/>
          <span class="badge badge-primary">起点站出发:</span>${array[0]}站🚉。<br/><strong>搭乘`
        let count = 1
        if (len == 0) {
            return res
        }
        let last_name = this.get_common_lines(array[0], array[1]) //第一条边的线路
        var old_set = new Set()
        for (let i = 1; i < len - 1; i++) {
            let name = sh_subway.get_common_lines(array[i], array[i + 1])
            var [flag, t_set] = set_have_common(last_name, name)
            if (flag == false) {
                res += set_to_string(old_set) + '</strong>,'
                res += `乘坐${count}站,抵达<strong>${array[i]}站</strong>。<br/>换乘<strong>`
                count = 0
            }
            count += 1
            last_name = name
            old_set = t_set
        }
        res += set_to_string(old_set) + '</strong>,'
        res += `乘坐${count}站。<br/><span class="badge badge-success">到达终点站:</span>${array[len - 1]}🚉`
        return res
    }

    // 根据起始站点的名字和终点站的名字返回最短的路径
    get_shortest_path(start_id, end_id) {
        this.array = []
        // 采用dijkstra算法
        let open_list = new Map()  //目前拓展但还没有得到最短路径值的节点
        let close_list = new Map() //已经得到最短路径值的节点
        open_list.set(start_id, 0)
        let parent = new Map()  //记录寻路路径
        parent.set(start_id, null)
        let min_dis = 0
        while (true) {
            // open_list 为零，那么没有找到对应的节点，失败，return false
            if (open_list.size == 0) {
                return false
            }
            let min_key, min_value = Infinity
            // 从open_list 中取出值最小的
            for (let [key, value] of open_list) {
                if (value < min_value) {
                    [min_key, min_value] = [key, value];
                }
            }
            open_list.delete(min_key) // 从openlist中弹出
            close_list.set(min_key, min_value) // 存入close_list节点
            // 如果找到了目标节点了
            if (min_key == end_id) {
                min_dis = min_value
                let path = [end_id]
                let father = parent.get(end_id) // 根据parent去寻找对应的祖先节点，回溯结果
                while (father != start_id) {
                    path.push(father)
                    father = parent.get(father)
                }
                path.push(start_id)
                path = path.reverse()
                this.array = path
                return [path, min_dis]
            }
            // 遍历取出的min节点对应的所有的边指向的节点
            for (let [key, value] of this.vertex_map.get(min_key).map) {
                if (close_list.has(key) == false) {
                    if (open_list.has(key) == true) {   // 如果在open_list 那么就尝试更新
                        if (value + min_value < open_list.get(key)) {
                            open_list.set(key, value + min_value)
                            parent.set(key, min_key)
                        }
                    } else // 不在openlist，那么添加
                    {
                        open_list.set(key, value + min_value)
                        parent.set(key, min_key)
                    }
                }
            }


        }
    }

    // 根据起始站点的名字和终点站的名字返回最少换乘的路径
    get_least_transfer(start_id, end_id) {
        this.array = []
        let open_list = new Map()  //目前拓展但还没有得到最短路径值的节点
        let close_list = new Map() //已经得到最短路径值的节点
        open_list.set(start_id, [0, new Set()])
        let parent = new Map()  //记录寻路路径
        parent.set(start_id, null)
        let min_dis = 0
        while (true) {
            // open_list 为零，那么没有找到对应的节点，失败，return false
            if (open_list.size == 0) {
                return false
            }
            let min_key, min_value = Infinity, min_line = new Set()
            // 从open_list 中取出值最小的
            for (let [key, [value, line]] of open_list) {
                if (value < min_value) {
                    [min_key, [min_value, min_line]] = [key, [value, line]];
                }
            }
            open_list.delete(min_key) // 从openlist中弹出
            close_list.set(min_key, min_value) // 存入close_list节点
            // 如果找到了目标节点了
            if (min_key == end_id) {
                min_dis = min_value
                let path = [end_id]
                let father = parent.get(end_id) // 根据parent去寻找对应的祖先节点，回溯结果
                while (father != start_id) {
                    path.push(father)
                    father = parent.get(father)
                }
                path.push(start_id)
                path = path.reverse()
                this.array = path
                return [path, min_dis]
            }
            // 遍历取出的min节点对应的所有的边指向的节点
            for (let [key, value] of this.vertex_map.get(min_key).map) {
                if (close_list.has(key) == false) {
                    var update_value = 0
                    var common_line = this.get_common_lines(key, min_key)
                    var [flag, t] = set_have_common(common_line, min_line)
                    if (flag == false)
                        update_value = min_value + 1
                    else
                        update_value = min_value


                    if (open_list.has(key) == true) {   // 如果在open_list 那么就尝试更新
                        if (update_value < open_list.get(key)[0]) {
                            if (flag == false) {
                                open_list.set(key, [update_value, common_line])
                                parent.set(key, min_key)
                            } else {
                                open_list.set(key, [update_value, t])
                                parent.set(key, min_key)
                            }

                        }
                    } else // 不在openlist，那么添加
                    {
                        if (flag == false) {
                            open_list.set(key, [update_value, common_line])
                            parent.set(key, min_key)
                        } else {
                            open_list.set(key, [update_value, t])
                            parent.set(key, min_key)
                        }

                    }

                }
            }
        }
    }
}

