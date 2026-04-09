const Files = java.nio.file.Files;
const Paths = java.nio.file.Paths;
const StandardCharsets = java.nio.charset.StandardCharsets;
lst=[]
let pathStr = "config/jsMacros/Macros/notebot/nts";
let dir = Paths.get(pathStr);
if (Files.exists(dir) && Files.isDirectory(dir)) {
    let stream = Files.list(dir);
    try {
        stream.forEach(path => {
            lst.push(path.getFileName().toString());
        });
    } catch (e) {
        Chat.log("§c读取目录时发生错误：" + e);
    } finally {
        stream.close();
    }
} else {
    Chat.log("§c指定的路径不存在或不是一个目录：" + pathStr);
}
Chat.log("§a请看向工作台(作为起始方块)")
function notejs(musicname)//没招不会写调用回调，就这样吧
{
    let lines

    try
    {
        // 设置文件路径 (相对路径通常相对于 JsMacros 根目录)
        let filePath = "config/jsMacros/Macros/notebot/nts/"+musicname;
        let path = Paths.get(filePath);
        // 读取文件内容为字符串
        let content = Files.readString(path, StandardCharsets.UTF_8);
        // 使用 Chat.log 输出
        Chat.log("文件读取成功：" + filePath);
        lines = content.trim().split(/\r?\n/);
        Chat.log("§a[解析] 总行数：" + lines.length);
    }
    catch (e)
    {
        // 输出错误信息
        Chat.log("读取文件失败：" + e);
    }
    //假人部分
    gb=Player.rayTraceBlock(8,false)
    if(gb==null || gb.getId()!="minecraft:crafting_table")
    {
        Chat.log("666这个入没给初始点,原因gb为null")
        ext++;
    }
    x=gb.getX()
    y=gb.getY()
    z=gb.getZ()
    Chat.log("起始坐标")
    Chat.log(gb.getX())
    Chat.log(gb.getY())
    Chat.log(gb.getZ())
    Chat.log("")
    //z++
    st=new Set();
    bot=[];
    timer=[];
    for (let i = 0; i < lines.length; i++)
    {
        let line = lines[i].trim();
        if (line === "") continue;
        
        let parts = line.split(/\s+/);
        if (parts.length >= 2) 
        {
            let first = parseInt(parts[0]);
            let second = parseFloat(parts[1]);
            if(first<-24 || first>48)
                continue;
            st.add(first)
            bot.push(first)
            timer.push(second)
            //player bot_notebot_1 attack
            //Chat.say("/player bot_notebot_"+first+" attack")
            //Time.sleep(second)
        }
    }
    let sum=0;
    for(let i=-24;i<=48;i++)
    {
        //player bot_notebot_1 spawn at 254740.70 109.00 254762.67 facing 0 90
        if(st.has(i))
        {
            Chat.say("/player bot_notebot_"+i+" spawn at "+x+" "+(y+1)+" "+(z+i+25)+" facing 0 90")
            sum++;
        }
    }
    Time.sleep(5000)
    Chat.log("§a曲目解析完成，共减少"+(73-sum)+"§a个假人，使用了"+sum+"§a个")
    Chat.log("beginning")
    //演奏部分
    for(let i=0;i<bot.length;i++)
    {
        Chat.say("/player bot_notebot_"+bot[i]+" attack")
        Time.sleep(timer[i])
    }
    Chat.log("done")
    Time.sleep(3000)
    for(let i=-24;i<=48;i++)
    {
        //player bot_notebot_1 spawn at 254740.70 109.00 254762.67 facing 0 90
        if(st.has(i))
        {
        Chat.say("/player bot_notebot_"+i+" kill")
        }
    }
}
note=Chat.createCommandBuilder('note')
note.greedyStringArg('Name')
note.suggestMatching(lst)
note.executes(JavaWrapper.methodToJavaAsync((e) => {
    name = e.getArg('Name')
    Chat.log("§a播放:"+name)
    notejs(name)
    return true;
}));
note.register()
event.stopListener = JavaWrapper.methodToJava(() => {
    Chat.unregisterCommand('note');
    return Client;
});