export interface CategoryStyle {
	/** 그라데이션 시작색 */
	readonly from: string;
	/** 그라데이션 끝색 */
	readonly to: string;
	/** 칩 텍스트·테두리 강조색 */
	readonly accent: string;
	/** 칩 배경용 연한색 */
	readonly soft: string;
}

/**
 * 자주 쓰는 카테고리는 고정 hue를 부여해 일관된 색을 유지한다.
 * 매핑에 없는 카테고리는 이름 해시로 hue를 만들어 자동 색을 부여한다.
 */
const PRESET_HUE: Readonly<Record<string, number>> = {
	Dev: 214,
	TIL: 262,
	Infra: 160,
	Design: 32,
	Backend: 280,
	Frontend: 199,
	AI: 330,
	DevOps: 14,
};

function hashHue(value: string): number {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) % 360;
	}
	return hash;
}

export function getCategoryStyle(category: string): CategoryStyle {
	const hue = PRESET_HUE[category] ?? hashHue(category);
	return {
		from: `hsl(${hue}, 72%, 56%)`,
		to: `hsl(${(hue + 28) % 360}, 70%, 40%)`,
		accent: `hsl(${hue}, 60%, 44%)`,
		soft: `hsl(${hue}, 70%, 95%)`,
	};
}
