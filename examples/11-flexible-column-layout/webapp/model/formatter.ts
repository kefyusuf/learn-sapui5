const oNumberFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 });

export const formatter = {

	formatTotal(nTotal: string | number): string {
		return oNumberFormat.format(Number(nTotal ?? 0));
	},

	formatStatusState(sStatus: string): string {
		switch (sStatus) {
			case "Shipped": return "Success";
			case "Processing": return "Warning";
			default: return "None";
		}
	}
};
