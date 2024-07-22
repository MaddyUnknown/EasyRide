class HistoryUtils {
    static addNewState(state) {
        history.pushState(state, '', state.path);
    }
    
    static updateCurrentState(state) {
        history.replaceState(state, '', state.path);
    }
}

export { HistoryUtils };