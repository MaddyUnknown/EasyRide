class FetchUtils {
    static async fetchListOfBusDetails(boardingPoint, droppingPoint, boardingDate) {
        const data = await fetch('https://0e39c890-189e-4aa1-87c1-df76d74c963c.mock.pstmn.io/search/bus').then(data => data.json());
        return data;
    }
}

export { FetchUtils };