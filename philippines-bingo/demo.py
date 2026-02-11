#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
필리핀 빙고 게임 데모 스크립트
Philippines Bingo Game Demo Script

이 스크립트는 필리핀 빙고 게임의 주요 기능을 데모합니다.
"""

import os
import sys
import webbrowser
import time
from datetime import datetime

def clear_screen():
    """화면 지우기"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    """헤더 출력"""
    print("=" * 60)
    print("🇵🇭 필리핀 문화 빙고 게임 - 데모 모드")
    print("=" * 60)
    print(f"데모 시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

def show_menu():
    """메뉴 표시"""
    print("📱 메뉴를 선택해 주세요:")
    print("1. 🎮 웹 버전 게임 실행 (추천)")
    print("2. 📂 파일 구조 확인")
    print("3. 📋 게임 특징 설명")
    print("4. 🧮 테스트 실행")
    print("5. 💡 사용자 피드백 보기")
    print("6. 📊 개선 로그 확인")
    print("7. 🚀 모든 기능 실행 (데모 모드)")
    print("8. ❌ 종료")
    print()

def open_web_game():
    """웹 게임 열기"""
    game_path = os.path.join(os.path.dirname(__file__), 'bingo_game.html')
    if os.path.exists(game_path):
        abs_path = os.path.abspath(game_path)
        print(f"\n🌐 웹 게임을 엽니다: {abs_path}")
        print("브라우저가 자동으로 열립니다...")
        webbrowser.open(f'file://{abs_path}')
        time.sleep(2)
        print("✅ 게임이 열렸습니다! 브라우저에서 게임을 즐겨보세요.")
    else:
        print("❌ bingo_game.html 파일을 찾을 수 없습니다.")

def show_file_structure():
    """파일 구조 표시"""
    print("\n📁 프로젝트 파일 구조:")
    print("=" * 40)
    
    bingo_dir = os.path.dirname(__file__)
    if os.path.exists(bingo_dir):
        for root, dirs, files in os.walk(bingo_dir):
            level = root.replace(bingo_dir, '').count(os.sep)
            indent = ' ' * 2 * level
            print(f"{indent}📂 {os.path.basename(root)}/")
            subindent = ' ' * 2 * (level + 1)
            for file in files:
                file_path = os.path.join(root, file)
                file_size = os.path.getsize(file_path)
                print(f"{subindent}📄 {file} ({file_size} bytes)")
    else:
        print("❌ 프로젝트 디렉토리를 찾을 수 없습니다.")

def explain_features():
    """게임 특징 설명"""
    print("\n🌟 게임 주요 특징:")
    print("=" * 40)
    
    features = [
        ("🎲", "5x5 빙고 카드 자동 생성", "매 게임마다 새로운 문화 요소 조합"),
        ("🎨", "6개 문화 카테고리", "음식, 축제, 관광지, 전통 의상, 전통 악기, 언어"),
        ("🌈", "카테고리별 색상 구분", "시각적으로 쉽게 요소 식별"),
        ("🎯", "자동 호출 기능", "게임 진행을 도와주는 자동 시스템"),
        ("📱", "반응형 디자인", "PC, 태블릿, 스마트폰 모두 호환"),
        ("🎉", "빙고 자동 감지", "게임 조건 충족 시 자동 알림"),
        ("📊", "실시간 통계", "게임 진행률 및 빙고 수 표시"),
        ("💬", "피드백 시스템", "사용자 의견 수집을 통한 지속적 개선"),
    ]
    
    for icon, title, desc in features:
        print(f"{icon} {title}")
        print(f"   └─ {desc}\n")

def run_tests():
    """테스트 실행"""
    print("\n🧮 게임 테스트 실행...")
    print("=" * 40)
    
    test_script = os.path.join(os.path.dirname(__file__), 'test_game.py')
    if os.path.exists(test_script):
        print("테스트 스크립트를 실행합니다...")
        os.system(f"python3 {test_script}")
    else:
        print("❌ test_game.py 파일을 찾을 수 없습니다.")

def show_feedback():
    """피드백 예시 표시"""
    print("\n💡 최근 사용자 피드백 예시:")
    print("=" * 40)
    
    feedback_examples = [
        {
            "user": "문화 탐험가",
            "rating": "⭐⭐⭐⭐⭐",
            "comment": "레칸도와 아도보를 알게 되어 정말 좋았습니다! 필리핀 음식에 대한 지식이 늘었어요.",
            "category": "음식"
        },
        {
            "user": "게임 매니아",
            "rating": "⭐⭐⭐⭐",
            "comment": "자동 호출 기능이 정말 편리해요. 다만 빙고 카드의 요소가 너무 작아서 눈이 아픕니다.",
            "category": "게임 플레이"
        },
        {
            "user": "교육자",
            "rating": "⭐⭐⭐⭐⭐",
            "comment": "학생들이 이 게임을 통해 필리핀 문화에 큰 흥미를 보이고 있습니다. 교육적으로 매우 유용합니다!",
            "category": "교육 효과"
        }
    ]
    
    for i, feedback in enumerate(feedback_examples, 1):
        print(f"\n📝 피드백 #{i}")
        print(f"   👤 사용자: {feedback['user']}")
        print(f"   ⭐ 평점: {feedback['rating']}")
        print(f"   📂 카테고리: {feedback['category']}")
        print(f"   💬 의견: {feedback['comment']}")

def show_improvement_log():
    """개선 로그 표시"""
    print("\n📊 최근 개선 로그:")
    print("=" * 40)
    
    log_path = os.path.join(os.path.dirname(__file__), 'IMPROVEMENT_LOG.md')
    if os.path.exists(log_path):
        print("최근 업데이트 내용:")
        print("✅ v1.0 초기 버전 완성")
        print("   - Python GUI 및 웹 버전 구현")
        print("   - 60개 문화 요소 데이터베이스")
        print("   - 자동화 테스트 시스템")
        print("   - 사용자 피드백 시스템")
        print("\n🚀 다음 개발 계획:")
        print("   - 모바일 앱 개발")
        print("   - 효과음 추가")
        print("   - 멀티플레이어 기능")
        print("   - 다른 국가 문화 게임 시리즈")
    else:
        print("❌ 개선 로그 파일을 찾을 수 없습니다.")

def demo_mode():
    """데모 모드 - 모든 기능 실행"""
    print("\n🚀 전체 데모 모드 시작!")
    print("=" * 40)
    
    # 1. 게임 소개
    print("\n1. 📖 게임 소개")
    explain_features()
    
    # 2. 웹 게임 실행
    print("\n2. 🌐 웹 게임 실행 중...")
    open_web_game()
    input("\n엔터 키를 눌러 계속...")
    
    # 3. 파일 구조 확인
    print("\n3. 📁 파일 구조")
    show_file_structure()
    
    # 4. 테스트 실행
    print("\n4. 🧮 테스트 실행")
    run_tests()
    
    # 5. 피드백 보기
    print("\n5. 💡 사용자 피드백")
    show_feedback()
    
    # 6. 개선 로그 확인
    print("\n6. 📊 개선 로그")
    show_improvement_log()
    
    print("\n" + "=" * 60)
    print("🎉 데모 모드 완료!")
    print("필리핀 빙고 게임의 모든 주요 기능을 확인하셨습니다.")
    print("=" * 60)

def main():
    """메인 함수"""
    clear_screen()
    print_header()
    
    while True:
        show_menu()
        choice = input("선택: ").strip()
        
        if choice == '1':
            open_web_game()
            input("\n엔터 키를 눌러 메뉴로 돌아가기...")
        elif choice == '2':
            show_file_structure()
            input("\n엔터 키를 눌러 메뉴로 돌아가기...")
        elif choice == '3':
            explain_features()
            input("\n엔터 키를 눌러 메뉴로 돌아가기...")
        elif choice == '4':
            run_tests()
            input("\n엔터 키를 눌러 메뉴로 돌아가기...")
        elif choice == '5':
            show_feedback()
            input("\n엔터 키를 눌러 메뉴로 돌아가기...")
        elif choice == '6':
            show_improvement_log()
            input("\n엔터 키를 눌러 메뉴로 돌아가기...")
        elif choice == '7':
            demo_mode()
            input("\n엔터 키를 눌러 메뉴로 돌아가기...")
        elif choice == '8':
            print("\n👋 감사합니다! 필리핀 빙고 게임을 즐겨주세요! 🇵🇭")
            break
        else:
            print("❌ 유효하지 않은 선택입니다. 1-8 사이의 숫자를 입력해 주세요.")
            time.sleep(1)
        
        clear_screen()
        print_header()

if __name__ == "__main__":
    main()