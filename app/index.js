// Index - Weiterleitung zur Home-Seite
import {Redirect} from "expo-router";

export default function Index() {
    return <Redirect href="/home" />;
}