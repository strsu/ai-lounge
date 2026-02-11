#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
필리핀 문화 테마 빙고 게임
Philippines Cultural Theme Bingo Game
"""

import tkinter as tk
from tkinter import ttk, messagebox
import random
import json
from datetime import datetime

class PhilippinesBingoGame:
    def __init__(self, root):
        self.root = root
        self.root.title("필리핀 문화 빙고 게임 - Philippines Cultural Bingo")
        self.root.geometry("1000x700")
        
        # 필리핀 문화 요소 리스트
        self.filipino_elements = {
            '음식': [
                '레칸도', '아도보', '시니간', '팔라브', '탄시아',
                '할로-할로', '레체 플란', '바나나 케치업', '디불-디불', '피시볼'
            ],
            '축제': [
                '사핀야한', '아티-아티', '피스티바', '마긴라야', '카니발',
                '파할로그', '신코 페스티벌', '피노이 빙고', '디바하웃', '할라와'
            ],
            '관광지': [
                '바라카이', '보라카이', '팔라완', '세부', '보홀',
                '마닐라 만', '타지마하카르', '바나우어 섬', '토네이도 알리', '산토 도밍고'
            ],
            '전통 의상': [
                '바라오트 사야', '타밀로크', '주스티', '바르오트', '살루오타',
                '마끄살라', '파닐리', '몬토소', '테를레사', '삼빗'
            ],
            '전통 악기': [
                '쿤투닝', '아기-아간', '빠누이', '탐보라', '잘링잘링',
                '부부이', '달링가링', '클라링', '감판', '아피시'
            ],
            '언어': [
                '사보쌍', '카라맛사', '마할로', '삐끄', '마무봇',
                '사라핑', '나나마스테', '텝코스', '욜로', '디네'
            ]
        }
        
        # 빙고 카드 설정
        self.card_size = 5
        self.card = []
        self.marked = []
        self.game_active = False
        self.bingo_count = 0
        
        self.create_widgets()
        self.generate_new_card()
        
    def create_widgets(self):
        # 상부 프레임
        top_frame = ttk.Frame(self.root)
        top_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # 제목
        title_label = ttk.Label(top_frame, text="🇵🇭 필리핀 문화 빙고 게임 🎉", 
                               font=('맑은 고딕', 20, 'bold'))
        title_label.pack(pady=10)
        
        # 게임 컨트롤 프레임
        control_frame = ttk.Frame(top_frame)
        control_frame.pack(fill=tk.X, pady=5)
        
        # 새 게임 버튼
        self.new_game_btn = ttk.Button(control_frame, text="새 게임 시작", 
                                      command=self.new_game)
        self.new_game_btn.pack(side=tk.LEFT, padx=5)
        
        # 빙고 호출 버튼
        self.call_bingo_btn = ttk.Button(control_frame, text="빙고! 🎊", 
                                        command=self.call_bingo, state=tk.DISABLED)
        self.call_bingo_btn.pack(side=tk.LEFT, padx=5)
        
        # 게임 상태 표시
        self.status_label = ttk.Label(control_frame, text="새 게임을 시작하십시오", 
                                     font=('맑은 고딕', 12))
        self.status_label.pack(side=tk.RIGHT, padx=10)
        
        # 메인 게임 영역
        game_frame = ttk.Frame(self.root)
        game_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 빙고 카드 프레임
        card_frame = ttk.LabelFrame(game_frame, text="나의 빙고 카드", 
                                   font=('맑은 고딕', 14, 'bold'))
        card_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        # 빙고 카드 생성
        self.card_labels = []
        for i in range(self.card_size):
            row_labels = []
            for j in range(self.card_size):
                label = tk.Label(card_frame, text="", width=15, height=2,
                               font=('맑은 고딕', 12), relief=tk.RIDGE,
                               bg='white', cursor='hand2')
                label.grid(row=i, column=j, padx=2, pady=2)
                label.bind('<Button-1>', lambda e, r=i, c=j: self.mark_cell(r, c))
                row_labels.append(label)
            self.card_labels.append(row_labels)
        
        # 중심에 FREE 표시
        center_label = self.card_labels[2][2]
        center_label.config(text="FREE\n🎉", font=('맑은 고딕', 14, 'bold'), bg='lightgreen')
        center_label.unbind('<Button-1>')
        
        # 호출된 번호 프레임
        called_frame = ttk.LabelFrame(game_frame, text="호출된 필리핀 문화 요소", 
                                     font=('맑은 고딕', 14, 'bold'))
        called_frame.pack(side=tk.RIGHT, fill=tk.BOTH, padx=5)
        
        # 호출된 번호 리스트
        self.called_listbox = tk.Listbox(called_frame, font=('맑은 고딕', 12), 
                                        height=20, width=30)
        self.called_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 자동 호출 프레임
        auto_call_frame = ttk.Frame(self.root)
        auto_call_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.auto_call_btn = ttk.Button(auto_call_frame, text="자동 호출 시작", 
                                       command=self.toggle_auto_call, state=tk.DISABLED)
        self.auto_call_btn.pack(side=tk.LEFT, padx=5)
        
        self.auto_call_label = ttk.Label(auto_call_frame, text="", 
                                        font=('맑은 고딕', 10))
        self.auto_call_label.pack(side=tk.LEFT, padx=10)
        
        # 게임 통계 프레임
        stats_frame = ttk.LabelFrame(self.root, text="게임 통계", 
                                    font=('맑은 고딕', 12, 'bold'))
        stats_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.stats_label = ttk.Label(stats_frame, text="", 
                                    font=('맑은 고딕', 10))
        self.stats_label.pack(padx=10, pady=5)
        
    def generate_new_card(self):
        """새로운 빙고 카드 생성"""
        self.card = []
        self.marked = [[False for _ in range(self.card_size)] for _ in range(self.card_size)]
        
        # 카테고리에서 무작위로 단어 선택
        all_elements = []
        for category, elements in self.filipino_elements.items():
            all_elements.extend([(category, elem) for elem in elements])
        
        # 중복 제거 후 셔플
        unique_elements = list(set([elem[1] for elem in all_elements]))
        random.shuffle(unique_elements)
        
        # 카드에 단어 채우기 (중심 제외)
        element_index = 0
        for i in range(self.card_size):
            card_row = []
            for j in range(self.card_size):
                if i == 2 and j == 2:  # 중심
                    card_row.append(("FREE", "FREE"))
                else:
                    # 원본 요소에서 카테고리 정보 함께 저장
                    for category, elements in self.filipino_elements.items():
                        if element_index < len(unique_elements) and unique_elements[element_index] in elements:
                            card_row.append((category, unique_elements[element_index]))
                            element_index += 1
                            break
            self.card.append(card_row)
        
        self.update_card_display()
        
    def update_card_display(self):
        """카드 디스플레이 업데이트"""
        for i in range(self.card_size):
            for j in range(self.card_size):
                if i == 2 and j == 2:
                    continue  # 중심은 건너뛰기
                
                category, element = self.card[i][j]
                color = 'lightyellow' if self.marked[i][j] else 'white'
                
                # 카테고리 색상 구분
                category_colors = {
                    '음식': '#FFE4B5',
                    '축제': '#FFB6C1',
                    '관광지': '#87CEEB',
                    '전통 의상': '#DDA0DD',
                    '전통 악기': '#98FB98',
                    '언어': '#F0E68C'
                }
                
                if category in category_colors:
                    color = category_colors[category]
                
                if self.marked[i][j]:
                    color = 'lightgreen'
                
                self.card_labels[i][j].config(text=f"{category}\n{element}", bg=color)
                
    def mark_cell(self, row, col):
        """셀 마킹"""
        if not self.game_active or (row == 2 and col == 2):
            return
            
        self.marked[row][col] = not self.marked[row][col]
        self.update_card_display()
        self.check_bingo()
        
    def new_game(self):
        """새 게임 시작"""
        self.game_active = True
        self.bingo_count = 0
        self.called_listbox.delete(0, tk.END)
        self.generate_new_card()
        self.status_label.config(text="게임 진행 중... 필리핀 문화 요소를 찾으십시오!")
        self.new_game_btn.config(state=tk.DISABLED)
        self.call_bingo_btn.config(state=tk.NORMAL)
        self.auto_call_btn.config(state=tk.NORMAL)
        self.auto_call_label.config(text="")
        self.update_stats()
        
    def get_random_element(self):
        """무작위 필리핀 문화 요소 반환"""
        all_elements = []
        for category, elements in self.filipino_elements.items():
            all_elements.extend([(category, elem) for elem in elements])
        
        random.shuffle(all_elements)
        return all_elements[0]
        
    def toggle_auto_call(self):
        """자동 호출 토글"""
        if not hasattr(self, 'auto_call_active'):
            self.auto_call_active = False
            
        self.auto_call_active = not self.auto_call_active
        
        if self.auto_call_active:
            self.auto_call_btn.config(text="자동 호출 중지")
            self.auto_call_label.config(text="자동 호출 중...")
            self.auto_call_element()
        else:
            self.auto_call_btn.config(text="자동 호출 시작")
            self.auto_call_label.config(text="")
            
    def auto_call_element(self):
        """자동으로 요소 호출"""
        if self.auto_call_active and self.game_active:
            category, element = self.get_random_element()
            
            # 이미 호출된 것인지 확인
            called_elements = self.called_listbox.get(0, tk.END)
            if f"{category}: {element}" not in called_elements:
                self.called_listbox.insert(tk.END, f"{category}: {element}")
                self.called_listbox.see(tk.END)
                self.update_stats()
                
                # 자동 마킹 (선택적)
                auto_mark = True  # True로 설정하면 자동으로 마킹됨
                if auto_mark:
                    for i in range(self.card_size):
                        for j in range(self.card_size):
                            if (i != 2 or j != 2) and not self.marked[i][j]:
                                if self.card[i][j][1] == element:
                                    self.marked[i][j] = True
                                    self.update_card_display()
                                    self.check_bingo()
                                    break
            
            # 3초 후 다음 호출
            self.root.after(3000, self.auto_call_element)
            
    def check_bingo(self):
        """빙고 확인"""
        # 가로 빙고 확인
        for i in range(self.card_size):
            if all(self.marked[i][j] or (i == 2 and j == 2) for j in range(self.card_size)):
                self.bingo_count += 1
                
        # 세로 빙고 확인
        for j in range(self.card_size):
            if all(self.marked[i][j] or (i == 2 and j == 2) for i in range(self.card_size)):
                self.bingo_count += 1
                
        # 대각선 빙고 확인
        if all(self.marked[i][i] or (i == 2 and i == 2) for i in range(self.card_size)):
            self.bingo_count += 1
            
        if all(self.marked[i][4-i] or (i == 2 and 4-i == 2) for i in range(self.card_size)):
            self.bingo_count += 1
            
        self.update_stats()
        
        if self.bingo_count >= 1:
            self.game_active = False
            self.call_bingo_btn.config(state=tk.DISABLED)
            self.auto_call_btn.config(state=tk.DISABLED)
            messagebox.showinfo("빙고!", f"축하합니다! 빙고를 완성했습니다! 🎉\n빙고 개수: {self.bingo_count}")
            
    def call_bingo(self):
        """빙고 호출"""
        if self.bingo_count >= 1:
            messagebox.showinfo("빙고 확인", f"축하합니다! 빙고를 완성했습니다! 🎉\n빙고 개수: {self.bingo_count}")
        else:
            messagebox.showwarning("빙고 아님", "아직 빙고 조건을 충족하지 못했습니다. 계속 진행하십시오!")
            
    def update_stats(self):
        """게임 통계 업데이트"""
        total_cells = self.card_size * self.card_size
        marked_cells = sum(sum(row) for row in self.marked)
        percentage = (marked_cells / (total_cells - 1)) * 100  # 중심 제외
        
        stats_text = f"마킹된 셀: {marked_cells}/{total_cells-1} ({percentage:.1f}%) | "
        stats_text += f"빙고 수: {self.bingo_count} | "
        stats_text += f"게임 상태: {'진행 중' if self.game_active else '종료됨'}"
        
        self.stats_label.config(text=stats_text)

def main():
    root = tk.Tk()
    game = PhilippinesBingoGame(root)
    root.mainloop()

if __name__ == "__main__":
    main()