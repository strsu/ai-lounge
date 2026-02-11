# nabijiyo QA Plan

## 1. Test Criteria Definition:

*   **Functional Testing:**  This will cover testing of all the core features.
*   **Performance Testing:**  This will involve assessing the speed and efficiency of the application.
*   **Usability Testing:**  This will focus on user experience and ease of use.

## 2. Service Catalog Preparation:

*   **Service Name:** nabijiyo
*   **Service Description:** A platform that summarizes and analyzes restaurant reviews from various sources.
*   **Endpoints:**
    *   `/api/search`:  Restaurant search functionality.
    *   `/api/detail`: Restaurant detail page.
    *   `/api/admin/*`:  Admin functionalities (맛집 등록, 포스팅 관리, 데이터 관리).
*   **Features List:**
    *   Restaurant search.
    *   Display of restaurant details, including overview information.
    *   Display of 종합 평점.
    *   Display of DO (공통점) and DONT (차이점) information.
    *   Display of 주의사항.
    *   Display of 참조 포스팅 목록.
    *   Admin functionality for restaurant and post management.
    *   Data collection from Naver blogs, Naver Knowledge, and potentially Instagram.

## 3. QA Verification Plan & Test Cases (initial draft):

*   **User-Centric Test Plan:**
    *   **Goal:**  To ensure the platform provides accurate and useful restaurant information, is easy to use, and functions as described in the project documentation.
    *   **Focus Areas:** Search functionality, information presentation (DO/DONT analysis, 평점), and the user interface.
*   **Test Cases (Draft - will be refined after the deployment and based on the exact endpoints):**

    *   **Search Functionality:**
        *   Test Case 1: Verify the search functionality by searching for existing restaurant names.
        *   Test Case 2: Test the search with different search queries including special characters.
        *   Test Case 3: Verify search result are sorted correctly based on the sorting options.
    *   **Restaurant Detail Page:**
        *   Test Case 4: Verify the display of the basic restaurant information (name, address, contact, etc.) is correct.
        *   Test Case 5: Verify the display of the 종합 평점 section.
        *   Test Case 6: Verify the display of DO (공통점) and DONT (차이점) are correct and meaningful.
        *   Test Case 7: Verify the display of the 주의사항.
        *   Test Case 8: Verify the display and links of the 참조 포스팅 목록.
    *   **Data Collection & Analysis:**
        *   Test Case 9: Verify the data collection from Naver blogs.
        *   Test Case 10: Verify the correct computation of the average ratings from the reviews.
    *   **Usability:**
        *   Test Case 11: Navigate the site easily.
        *   Test Case 12: Ensure all links on the site work.
    *   **Admin Functionality:**
        *   Test Case 13: Verify the Admin Login works. (If implemented)
        *   Test Case 14: Verify Restaurant can be added.

