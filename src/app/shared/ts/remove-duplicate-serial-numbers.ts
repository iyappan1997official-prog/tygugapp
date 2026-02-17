export function removeDuplicateSerialNumbers(newQuilts: any[], newPallets: any[], palletSerialNumber: any[]): string[] {
    let quiltSerialNumbers: any[] = [];

    if (newQuilts?.length) {
        newQuilts.forEach((quilt: any) => {
            if (!quiltSerialNumbers.includes(quilt.serialNumber)) {
                quiltSerialNumbers.push(quilt.serialNumber);
            }
        })
    }
    // debugger
    if (newPallets?.length && palletSerialNumber?.length) {
        palletSerialNumber.forEach((pallet: any) => {
            // pallet?.quilts?.forEach((quilt: any) => {
            if (!quiltSerialNumbers.includes(pallet)) {
                // quiltSerialNumbers.push(quilt.serialNumber);
                quiltSerialNumbers.push(pallet);
            }
            // })
        })
    }

    return quiltSerialNumbers || [];
}