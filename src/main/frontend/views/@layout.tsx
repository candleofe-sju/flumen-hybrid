import { useViewConfig } from '@vaadin/hilla-file-router/runtime.js';
import { effect, signal } from '@vaadin/hilla-react-signals';
import { AppLayout, DrawerToggle, Icon, SideNav, SideNavItem } from '@vaadin/react-components';
import { Avatar } from '@vaadin/react-components/Avatar.js';
import { Button } from '@vaadin/react-components/Button.js';
import { TextField } from "@vaadin/react-components/TextField.js";
import { logout, useAuth } from 'Frontend/util/auth.js';
import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getAll } from 'Frontend/generated/NavItemEndpoint';
import NavItem from "Frontend/generated/com/eugentia/app/data/entity/NavItem";

const defaultTitle = document.title;
const documentTitleSignal = signal('');

effect(() => {
    document.title = documentTitleSignal.value;
});

// Publish for Vaadin to use
(window as any).Vaadin.documentTitleSignal = documentTitleSignal;

export default function MainLayout() {
    const currentTitle = useViewConfig()?.title ?? defaultTitle;
    const navigate = useNavigate();
    const location = useLocation();
    const [navItems, setNavItems] = useState<NavItem[]>([]);

    useEffect(() => {
        documentTitleSignal.value = currentTitle;
    }, [currentTitle]);

    useEffect(() => {
        getAll().then(values => setNavItems(values));
    }, []);

    const {state} = useAuth();
    const profilePictureUrl =
        state.user &&
        `data:image;base64,${btoa(
            state.user.profilePicture.reduce((str, n) => str + String.fromCharCode((n + 256) % 256), ''),
        )}`;
    return (
        <AppLayout primarySection="drawer">
            <div slot="drawer" className="flex flex-col justify-between h-full p-m">
                <header className="flex flex-col gap-m">
                    <span className="font-semibold text-l">Flumen</span>
                    <TextField className="navi-drawer" placeholder="Search" clearButtonVisible={true}
                               onValueChanged={(e) => {
                                   let nav = document.getElementById("nav");

                                   if (nav == null) return;

                                   let children = nav.children;
                                   let length = children.length;
                                   for (let i = 0; i < length; i++) {
                                       let element = children[i];
                                       let visible = element.textContent?.toLowerCase().includes(e.detail.value.toLowerCase());
                                       (element as HTMLElement).style.display = visible ? "block" : "none";
                                   }
                               }}/>
                    <SideNav id="nav" onNavigate={({path}) => navigate(path!)} location={location}>
                        {
                            navItems.filter((value => value.parentIdx == 0)).map(({id, parentIdx, path, icon, title}) => (
                                <SideNavItem {...(navItems.filter((value => value.parentIdx == id)).length == 0 && {path: path})} key={path}>
                                    {icon ? <Icon src={icon} slot="prefix"></Icon> : <></>}
                                    {title}
                                    {
                                        navItems.filter((value => value.parentIdx == id)).map(({id, parentIdx, path, icon, title}) => (
                                            <SideNavItem path={path} key={path} slot="children">
                                                {icon ? <Icon src={icon} slot="prefix"></Icon> : <></>}
                                                {title}
                                            </SideNavItem>
                                        ))
                                    }
                                </SideNavItem>
                            ))
                        }
                    </SideNav>
                </header>
                <footer className="flex flex-col gap-s">
                    {state.user ? (
                        <>
                            <div className="flex items-center gap-s">
                                <Avatar theme="xsmall" img={profilePictureUrl} name={state.user.name}/>
                                {state.user.name}
                            </div>
                            <Button
                                onClick={async () => {
                                    await logout();
                                    document.location.reload();
                                }}
                            >
                                Sign out
                            </Button>
                        </>
                    ) : (
                        <Link to="/login">Sign in</Link>
                    )}
                </footer>
            </div>

            <DrawerToggle slot="navbar" aria-label="Menu toggle"></DrawerToggle>
            <h1 slot="navbar" className="text-l m-0">
                {documentTitleSignal}
            </h1>

            <Suspense>
                <Outlet/>
            </Suspense>
        </AppLayout>
    );
}
