// Texts. For now Russian only.

export function plural(n){const a=n%10,b=n%100;const w=(a===1&&b!==11)?'щелчок':(a>=2&&a<=4&&(b<10||b>=20))?'щелчка':'щелчков';return n+' '+w;}
