import openpyxl
import json

# 打开Excel文件
workbook = openpyxl.load_workbook('game_map1.xlsx')

# 选择第一个工作表
sheet = workbook.active

# 创建一个20*20的二维数组
game_map = [[0 for i in range(20)] for j in range(20)]

# 遍历单元格并将内容存储到二维数组中
for i in range(1, 21):
    for j in range(1, 21):
        game_map[i-1][j-1] = sheet.cell(row=i, column=j).value
# 打印出二维数组中的内容
print("[")
for row in game_map:
    print(row, ",")
print("];")

# 输出到文件
with open('out.json', 'w') as f:
    json.dump(game_map, f)



# pip使用清华源
# -i https://pypi.tuna.tsinghua.edu.cn/simple