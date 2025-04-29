import Layout from "./Layout.jsx";

import HomePage from "./HomePage";

import ShelterForm from "./ShelterForm";

import OrganizationManagement from "./OrganizationManagement";

import BranchManagement from "./BranchManagement";

import CoordinatorDashboard from "./CoordinatorDashboard";

import ShelterView from "./ShelterView";

import BusinessVerification from "./BusinessVerification";

import UserProfile from "./UserProfile";

import SearchShelters from "./SearchShelters";

import PublicShelterView from "./PublicShelterView";

import ContactUs from "./ContactUs";

import AdminModeration from "./AdminModeration";

import AccessibilityResources from "./AccessibilityResources";

import AdminShelterManagement from "./AdminShelterManagement";

import About from "./About";

import Support from "./Support";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    HomePage: HomePage,
    
    ShelterForm: ShelterForm,
    
    OrganizationManagement: OrganizationManagement,
    
    BranchManagement: BranchManagement,
    
    CoordinatorDashboard: CoordinatorDashboard,
    
    ShelterView: ShelterView,
    
    BusinessVerification: BusinessVerification,
    
    UserProfile: UserProfile,
    
    SearchShelters: SearchShelters,
    
    PublicShelterView: PublicShelterView,
    
    ContactUs: ContactUs,
    
    AdminModeration: AdminModeration,
    
    AccessibilityResources: AccessibilityResources,
    
    AdminShelterManagement: AdminShelterManagement,
    
    About: About,
    
    Support: Support,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<HomePage />} />
                
                
                <Route path="/HomePage" element={<HomePage />} />
                
                <Route path="/ShelterForm" element={<ShelterForm />} />
                
                <Route path="/OrganizationManagement" element={<OrganizationManagement />} />
                
                <Route path="/BranchManagement" element={<BranchManagement />} />
                
                <Route path="/CoordinatorDashboard" element={<CoordinatorDashboard />} />
                
                <Route path="/ShelterView" element={<ShelterView />} />
                
                <Route path="/BusinessVerification" element={<BusinessVerification />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/SearchShelters" element={<SearchShelters />} />
                
                <Route path="/PublicShelterView" element={<PublicShelterView />} />
                
                <Route path="/ContactUs" element={<ContactUs />} />
                
                <Route path="/AdminModeration" element={<AdminModeration />} />
                
                <Route path="/AccessibilityResources" element={<AccessibilityResources />} />
                
                <Route path="/AdminShelterManagement" element={<AdminShelterManagement />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Support" element={<Support />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}