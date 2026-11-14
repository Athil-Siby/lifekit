/** Typing test word list and scoring. */
export const COMMON_WORDS = 'the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us great between need large often hand high place hold turn real life few north open seem together next white children begin got walk example ease paper group always music those both mark book letter until mile river car feet care second enough plain girl usual young ready above ever red list though feel talk bird soon body dog family direct pose leave song measure door product black short numeral class wind question happen complete ship area half rock order fire south problem piece told knew pass since top whole king space heard best hour better true during hundred five remember step early west ground interest reach fast verb sing listen six table travel less morning ten simple several vowel toward war lay against pattern slow center love person money serve appear road map rain rule govern pull cold notice voice unit power town fine certain fly fall lead cry dark machine note wait plan figure star box noun field rest correct able pound done beauty drive stood contain front teach week final gave green oh quick develop ocean warm free minute strong special mind behind clear tail produce fact street inch multiply nothing course stay wheel full force blue object decide surface deep moon island foot system busy test record boat common gold possible plane stead dry wonder laugh thousand ago ran check game shape equate miss brought heat snow tire bring yes distant fill east paint language among'.split(' ');

export function wordStream(count: number, rng: () => number = Math.random): string[] {
  return Array.from({ length: count }, () => COMMON_WORDS[Math.floor(rng() * COMMON_WORDS.length)]);
}

/**
 * Score a typing run. `typed` is the list of submitted words (the last may be in progress).
 * WPM uses the standard 5 characters per word, counting only correctly typed characters.
 */
export function scoreTyping(target: string[], typed: string[], seconds: number) {
  let correctChars = 0, totalChars = 0, correctWords = 0, wrongWords = 0;
  typed.forEach((w, i) => {
    const t = target[i] ?? '';
    totalChars += w.length + (i < typed.length - 1 ? 1 : 0);
    for (let k = 0; k < w.length; k++) if (w[k] === t[k]) correctChars++;
    if (i < typed.length - 1) {
      if (w === t) { correctWords++; correctChars++; } else wrongWords++;
    }
  });
  const minutes = Math.max(seconds, 1) / 60;
  return {
    wpm: Math.round(correctChars / 5 / minutes),
    rawWpm: Math.round(totalChars / 5 / minutes),
    accuracy: totalChars ? Math.round((correctChars / totalChars) * 100) : 100,
    correctWords,
    wrongWords,
  };
}
