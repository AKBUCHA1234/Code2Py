export interface Challenge {
  title: string
  language: 'c' | 'cpp' | 'java'
  topic: string
  code: string
}

// A curated rotation of DSA snippets — one surfaces per day.
const CHALLENGES: Challenge[] = [
  {
    title: 'Binary Search',
    language: 'cpp',
    topic: 'Searching',
    code: `int binarySearch(int a[], int n, int x) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == x) return mid;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  },
  {
    title: 'Bubble Sort',
    language: 'c',
    topic: 'Sorting',
    code: `void bubbleSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - 1 - i; j++)
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
            }
}`,
  },
  {
    title: 'Factorial (Recursion)',
    language: 'c',
    topic: 'Recursion',
    code: `int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
  },
  {
    title: 'Fibonacci (DP)',
    language: 'cpp',
    topic: 'Dynamic Programming',
    code: `int fib(int n) {
    int dp[100];
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}`,
  },
  {
    title: 'Reverse a Linked List',
    language: 'java',
    topic: 'Linked Lists',
    code: `Node reverse(Node head) {
    Node prev = null;
    while (head != null) {
        Node next = head.next;
        head.next = prev;
        prev = head;
        head = next;
    }
    return prev;
}`,
  },
  {
    title: 'Two Sum',
    language: 'java',
    topic: 'Hashing',
    code: `int[] twoSum(int[] nums, int target) {
    HashMap<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (seen.containsKey(need)) return new int[]{seen.get(need), i};
        seen.put(nums[i], i);
    }
    return new int[]{};
}`,
  },
  {
    title: 'GCD (Euclid)',
    language: 'c',
    topic: 'Math',
    code: `int gcd(int a, int b) {
    while (b != 0) {
        int t = b;
        b = a % b;
        a = t;
    }
    return a;
}`,
  },
  {
    title: 'Max Subarray (Kadane)',
    language: 'cpp',
    topic: 'Dynamic Programming',
    code: `int maxSubArray(int a[], int n) {
    int best = a[0], cur = a[0];
    for (int i = 1; i < n; i++) {
        cur = max(a[i], cur + a[i]);
        best = max(best, cur);
    }
    return best;
}`,
  },
  {
    title: 'Palindrome Check',
    language: 'c',
    topic: 'Two Pointers',
    code: `int isPalindrome(char s[], int n) {
    int i = 0, j = n - 1;
    while (i < j) {
        if (s[i] != s[j]) return 0;
        i++; j--;
    }
    return 1;
}`,
  },
  {
    title: 'Insertion Sort',
    language: 'cpp',
    topic: 'Sorting',
    code: `void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}`,
  },
  {
    title: 'Power (Fast Exponentiation)',
    language: 'java',
    topic: 'Divide & Conquer',
    code: `long power(long base, long exp) {
    long result = 1;
    while (exp > 0) {
        if ((exp & 1) == 1) result *= base;
        base *= base;
        exp >>= 1;
    }
    return result;
}`,
  },
  {
    title: 'Count Set Bits',
    language: 'c',
    topic: 'Bit Manipulation',
    code: `int countBits(int n) {
    int count = 0;
    while (n) {
        n &= (n - 1);
        count++;
    }
    return count;
}`,
  },
]

/** The same challenge for everyone on a given day; rotates at local midnight. */
export function getTodaysChallenge(): Challenge {
  const epochDay = Math.floor(Date.now() / 86_400_000)
  return CHALLENGES[epochDay % CHALLENGES.length]
}

/** A per-day key for marking the challenge done in localStorage. */
export function todaysKey(): string {
  return `challenge-done-${new Date().toDateString()}`
}
