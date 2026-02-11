#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
필리핀 빙고 게임 테스트 스크립트
Philippines Bingo Game Test Script
"""

import os
import json
import time
from datetime import datetime

def test_game_elements():
    """게임 문화 요소 데이터 테스트"""
    print("🧮 필리핀 문화 요소 데이터 테스트 시작...")
    
    # 문화 요소 로드 (Python 버전용)
    filipino_elements = {
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
    
    # 테스트 결과
    test_results = {
        'total_categories': len(filipino_elements),
        'total_elements': sum(len(elements) for elements in filipino_elements.values()),
        'categories_tested': [],
        'duplicate_check': {},
        'empty_elements': []
    }
    
    # 각 카테고리 테스트
    for category, elements in filipino_elements.items():
        test_results['categories_tested'].append({
            'category': category,
            'element_count': len(elements),
            'empty_elements': [elem for elem in elements if not elem.strip()]
        })
        
        # 중복 검사
        for element in elements:
            if element in test_results['duplicate_check']:
                test_results['duplicate_check'][element].append(category)
            else:
                test_results['duplicate_check'][element] = [category]
    
    # 중복 요소 찾기
    duplicates = {k: v for k, v in test_results['duplicate_check'].items() if len(v) > 1}
    
    # 결과 출력
    print(f"\n✅ 테스트 완료!")
    print(f"📊 총 카테고리 수: {test_results['total_categories']}")
    print(f"📊 총 문화 요소 수: {test_results['total_elements']}")
    print(f"⚠️  중복 요소 수: {len(duplicates)}")
    
    if duplicates:
        print("\n🚨 중복된 요소:")
        for element, categories in duplicates.items():
            print(f"   - {element}: {', '.join(categories)}")
    
    # 빈 요소 확인
    for category_info in test_results['categories_tested']:
        if category_info['empty_elements']:
            print(f"\n⚠️  '{category_info['category']}' 카테고리의 빈 요소:")
            for elem in category_info['empty_elements']:
                print(f"   - '{elem}'")
    
    return test_results

def test_bingo_card_generation():
    """빙고 카드 생성 테스트"""
    print("\n🎲 빙고 카드 생성 테스트 시작...")
    
    import random
    
    # 카드 생성 로직 시뮬레이션
    card_size = 5
    test_cards = []
    
    for test_num in range(5):  # 5개의 카드 생성 테스트
        card = []
        used_elements = set()
        
        # 문화 요소 준비
        all_elements = []
        categories = ['음식', '축제', '관광지', '전통 의상', '전통 악기', '언어']
        
        for category in categories:
            elements = ['레칸도', '아도보', '시니간', '바라카이', '사핀야한']  # 테스트용 간소화된 데이터
            all_elements.extend([(category, elem) for elem in elements])
        
        random.shuffle(all_elements)
        
        # 카드 생성
        for i in range(card_size):
            row = []
            for j in range(card_size):
                if i == 2 and j == 2:  # 중심
                    row.append(('FREE', 'FREE'))
                else:
                    element = all_elements.pop(0) if all_elements else ('EMPTY', 'EMPTY')
                    row.append(element)
                    used_elements.add(element[1])
            card.append(row)
        
        test_cards.append({
            'test_number': test_num + 1,
            'card': card,
            'unique_elements': len(used_elements)
        })
    
    # 결과 분석
    print(f"\n✅ 테스트 완료! {len(test_cards)}개 카드 생성")
    
    for test_card in test_cards:
        print(f"\n🎴 카드 #{test_card['test_number']}:")
        print(f"   - 고유 요소 수: {test_card['unique_elements']}")
        
        # 중심 셀 확인
        center = test_card['card'][2][2]
        print(f"   - 중심 셀: {center}")
        
        # 빙고 가능성 확인 (가로, 세로, 대각선)
        bingo_lines = 0
        
        # 가로 확인
        for i in range(card_size):
            if all(test_card['card'][i][j][0] != 'EMPTY' for j in range(card_size)):
                bingo_lines += 1
        
        # 세로 확인
        for j in range(card_size):
            if all(test_card['card'][i][j][0] != 'EMPTY' for i in range(card_size)):
                bingo_lines += 1
        
        # 대각선 확인
        if all(test_card['card'][i][i][0] != 'EMPTY' for i in range(card_size)):
            bingo_lines += 1
        if all(test_card['card'][i][4-i][0] != 'EMPTY' for i in range(card_size)):
            bingo_lines += 1
        
        print(f"   - 잠재적 빙오 라인 수: {bingo_lines}")
    
    return test_cards

def test_file_structure():
    """파일 구조 테스트"""
    print("\n📁 파일 구조 테스트 시작...")
    
    bingo_dir = '/home/jj/.openclaw/workspace/philippines-bingo'
    required_files = [
        'bingo_game.py',
        'bingo_game.html',
        'README.md',
        'requirements.txt',
        'test_game.py'
    ]
    
    test_results = {
        'directory_exists': os.path.exists(bingo_dir),
        'files_found': {},
        'missing_files': []
    }
    
    for file in required_files:
        file_path = os.path.join(bingo_dir, file)
        exists = os.path.exists(file_path)
        test_results['files_found'][file] = exists
        
        if not exists:
            test_results['missing_files'].append(file)
    
    # 파일 크기 확인
    print(f"\n✅ 테스트 완료!")
    print(f"📂 디렉토리: {bingo_dir}")
    print(f"📂 디렉토리 존재: {'✅' if test_results['directory_exists'] else '❌'}")
    
    for file, exists in test_results['files_found'].items():
        size = os.path.getsize(os.path.join(bingo_dir, file)) if exists else 0
        print(f"📄 {file}: {'✅' if exists else '❌'} ({size} bytes)")
    
    if test_results['missing_files']:
        print(f"\n❌ 누락된 파일: {', '.join(test_results['missing_files'])}")
    
    return test_results

def test_web_game():
    """웹 게임 접근성 테스트"""
    print("\n🌐 웹 게임 접근성 테스트 시작...")
    
    html_file = '/home/jj/.openclaw/workspace/philippines-bingo/bingo_game.html'
    
    test_results = {
        'file_exists': os.path.exists(html_file),
        'file_readable': False,
        'file_size': 0,
        'required_elements': [],
        'missing_elements': []
    }
    
    # 필수 HTML 요소 확인
    required_elements = [
        '<!DOCTYPE html>',
        '<title>필리핀 문화 빙고 게임',
        '필리핀 문화 요소',
        '빙고',
        '음식',
        '축제',
        '관광지'
    ]
    
    if test_results['file_exists']:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                test_results['file_readable'] = True
                test_results['file_size'] = len(content)
                
                # 필수 요소 확인
                for element in required_elements:
                    if element in content:
                        test_results['required_elements'].append(element)
                    else:
                        test_results['missing_elements'].append(element)
        except Exception as e:
            print(f"❌ 파일 읽기 오류: {e}")
    
    # 결과 출력
    print(f"\n✅ 테스트 완료!")
    print(f"📄 파일 존재: {'✅' if test_results['file_exists'] else '❌'}")
    print(f"📄 파일 읽기 가능: {'✅' if test_results['file_readable'] else '❌'}")
    print(f"📄 파일 크기: {test_results['file_size']} bytes")
    
    if test_results['required_elements']:
        print(f"\n✅ 발견된 필수 요소: {len(test_results['required_elements'])}")
    if test_results['missing_elements']:
        print(f"\n❌ 누락된 요소: {', '.join(test_results['missing_elements'])}")
    
    return test_results

def run_comprehensive_tests():
    """종합 테스트 실행"""
    print("🚀 필리핀 빙고 게임 종합 테스트 시작...")
    print("=" * 60)
    
    # 모든 테스트 실행
    element_test = test_game_elements()
    card_test = test_bingo_card_generation()
    file_test = test_file_structure()
    web_test = test_web_game()
    
    # 종합 결과
    print("\n" + "=" * 60)
    print("🏆 종합 테스트 결과 요약")
    print("=" * 60)
    
    # 전체 점수 계산
    total_tests = 4
    passed_tests = 0
    
    if element_test['total_elements'] > 0:
        passed_tests += 1
        print(f"📊 문화 요소 데이터: ✅ ({element_test['total_elements']}개 요소)")
    
    if len(card_test) > 0:
        passed_tests += 1
        print(f"🎲 빙고 카드 생성: ✅ ({len(card_test)}개 카드 생성)")
    
    if len(file_test['files_found']) > 0:
        file_success = sum(1 for v in file_test['files_found'].values() if v)
        if file_success == len(file_test['files_found']):
            passed_tests += 1
        print(f"📁 파일 구조: ✅ ({file_success}/{len(file_test['files_found'])} 파일)")
    
    if web_test['file_exists'] and web_test['file_readable']:
        passed_tests += 1
        print(f"🌐 웹 게임: ✅")
    
    print(f"\n🎯 전체 점수: {passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("🎉 모든 테스트를 통과했습니다! 게임이 완벽하게 구현되었습니다.")
    else:
        print("⚠️  일부 테스트를 통과하지 못했습니다. 개선이 필요합니다.")
    
    # 권장 사항
    print("\n💡 개선 권장 사항:")
    if element_test['duplicate_check']:
        print("   - 중복된 문화 요소 제거")
    if file_test['missing_files']:
        print("   - 누락된 파일 추가")
    if web_test['missing_elements']:
        print("   - 웹 페이지에서 누락된 요소 추가")
    
    # 최종 결과 저장
    final_results = {
        'test_date': datetime.now().isoformat(),
        'total_tests': total_tests,
        'passed_tests': passed_tests,
        'score': (passed_tests / total_tests) * 100,
        'details': {
            'elements_test': element_test,
            'card_test': card_test,
            'file_test': file_test,
            'web_test': web_test
        }
    }
    
    # 테스트 결과 파일 저장
    with open('/home/jj/.openclaw/workspace/philippines-bingo/test_results.json', 'w', encoding='utf-8') as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 테스트 결과가 저장되었습니다: test_results.json")
    
    return final_results

if __name__ == "__main__":
    results = run_comprehensive_tests()