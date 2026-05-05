import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ResearchModule from './modules/Research';
import ArchitectureModule from './modules/Architecture';
import PerformanceMetrics from './modules/PerformanceMetrics';
import LoadTesting from './modules/LoadTesting';
import ScriptGenerator from './modules/ScriptGenerator';
import Diagnostics from './modules/Diagnostics';
import Utilities from './modules/Utilities';
import BrowserModule from './modules/BrowserModule';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import ExportButtons from './components/ExportButtons';

const App: React.FC = () => {
    const [data, setData] = useLocalStorage('dataKey', '');
    const [isDirty, setIsDirty] = useUnsavedChanges();

    React.useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = ''; // Show warning
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    return (
        <Router>
            <div>
                <Sidebar />
                <main>
                    <Switch>
                        <Route path="/research" component={ResearchModule} />
                        <Route path="/architecture" component={ArchitectureModule} />
                        <Route path="/performance" component={PerformanceMetrics} />
                        <Route path="/load-testing" component={LoadTesting} />
                        <Route path="/script-generator" component={ScriptGenerator} />
                        <Route path="/diagnostics" component={Diagnostics} />
                        <Route path="/utilities" component={Utilities} />
                        <Route path="/browser" component={BrowserModule} />
                    </Switch>
                </main>
                <ExportButtons data={data} />
            </div>
        </Router>
    );
};

export default App;