import mido
import os

def convert_midi_to_note(input_filename='1.mid', output_filename='1.nt'):
    # 检查文件是否存在
    if not os.path.exists(input_filename):
        print(f"错误：找不到文件 {input_filename}")
        return

    try:
        mid = mido.MidiFile(input_filename)
    except Exception as e:
        print(f"读取 MIDI 文件失败：{e}")
        return

    # 获取 MIDI 的 ticks per beat (每拍的刻度数)
    ticks_per_beat = mid.ticks_per_beat
    
    # 初始化变量
    # 为了减少浮点累加误差，内部依然使用秒 (float) 进行高精度累加
    # 仅在输出计算时转换为毫秒
    current_time_seconds = 0.0
    current_tempo = 500000  # 默认速度 120 BPM (500,000 微秒/拍)
    
    notes_list = [] # 用于存储 (音高，绝对时间秒数)

    # 合并所有轨道并按时间顺序处理消息
    for msg in mido.merge_tracks(mid.tracks):
        # 1. 计算当前消息距离上一条消息的时间间隔 (秒)
        # 注意：tempo 变化影响的是之后的时间，所以先用当前 tempo 计算 delta
        delta_seconds = mido.tick2second(msg.time, ticks_per_beat, current_tempo)
        current_time_seconds += delta_seconds

        # 2. 如果是设置速度的消息，更新当前速度 (影响下一条消息的时间计算)
        if msg.type == 'set_tempo':
            current_tempo = msg.tempo

        # 3. 如果是音符开启消息 (且力度大于 0，代表真正的音符开始)
        if msg.type == 'note_on' and msg.velocity > 0:
            # 音高转换逻辑：
            # 用户定义：6 = 标准音 C (通常 MIDI 60), 0 = F# (通常 MIDI 54)
            # 推算公式：输出音高 = MIDI 音符编号 - 54
            custom_pitch = msg.note - 54
            
            notes_list.append({
                'pitch': custom_pitch,
                'time': current_time_seconds
            })

    # 写入文件
    try:
        with open(output_filename, 'w', encoding='utf-8') as f:
            total_notes = len(notes_list)
            
            for i, note in enumerate(notes_list):
                pitch = note['pitch']
                
                # 计算与下一个音符的间隔
                if i < total_notes - 1:
                    # 核心修改：先计算秒数差值，再转为毫秒，最后四舍五入取整
                    # 这样可以最大程度减少浮点数累加带来的微小误差
                    delta_sec = notes_list[i+1]['time'] - note['time']
                    interval_ms = round(delta_sec * 1000)
                else:
                    # 最后一个音符，没有后续音符，间隔设为 0
                    interval_ms = 0
                
                # 确保非负数 (防止极端的浮点误差导致 -0 或 -1)
                if interval_ms < 0:
                    interval_ms = 0

                # 写入格式：音高 间隔 (毫秒整数)
                f.write(f"{pitch} {interval_ms}\n")
        
        print(f"转换成功！已生成 {output_filename}")
        print(f"共处理 {total_notes} 个音符。")
        print(f"时间单位：毫秒 (ms)")

    except Exception as e:
        print(f"写入文件失败：{e}")

if __name__ == '__main__':
    convert_midi_to_note()
