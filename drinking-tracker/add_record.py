#!/usr/bin/env python3
"""
술 먹는 날 체크 - 데이터 추가 스크립트
"""

import json
import sys
from datetime import datetime

DATA_FILE = '/home/jj/.openclaw/workspace/drinking-tracker/data.json'

def add_record(date, people=None, food=None):
    """술 마신 기록 추가"""
    try:
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {"records": []}

    # 기존 기록 확인
    existing = None
    for record in data['records']:
        if record['date'] == date:
            existing = record
            break

    if existing:
        # 기존 기록 업데이트
        if people is not None:
            existing['people'] = people
        if food is not None:
            existing['food'] = food
    else:
        # 새 기록 추가
        record = {'date': date}
        if people is not None:
            record['people'] = people
        if food is not None:
            record['food'] = food
        data['records'].append(record)

    # 날짜순 정렬
    data['records'].sort(key=lambda x: x['date'])

    # 저장
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # 결과 출력
    result = f"✅ 기록 완료: {date}"
    if people:
        result += f" - {', '.join(people)}"
    if food:
        result += f" (음식: {food})"
    print(result)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("사용법: python add_record.py <날짜> [--people <사람1> <사람2> ...] [--food <음식>]")
        print("예시: python add_record.py 2026-02-02 --people 진수 수호 --food 곱창")
        print("예시: python add_record.py today --people 진수 수호 --food 곱창")
        sys.exit(1)

    date_str = sys.argv[1]

    # today 처리
    if date_str == 'today':
        date_str = datetime.now().strftime('%Y-%m-%d')

    # 파싱
    people = None
    food = None

    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '--people':
            i += 1
            people = []
            while i < len(sys.argv) and not sys.argv[i].startswith('--'):
                people.append(sys.argv[i])
                i += 1
        elif sys.argv[i] == '--food':
            i += 1
            if i < len(sys.argv):
                food = sys.argv[i]
                i += 1
        else:
            # 이전 방식 호환성: --people 없이 바로 사람 이름
            if people is None:
                people = []
            while i < len(sys.argv) and not sys.argv[i].startswith('--'):
                people.append(sys.argv[i])
                i += 1

    add_record(date_str, people, food)
