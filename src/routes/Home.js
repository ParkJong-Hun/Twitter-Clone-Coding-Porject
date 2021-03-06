import { dbService, storageService } from "fbase";
import React, { useEffect, useState } from "react";
import Pweet from "../components/Pweet";
import { v4 as uuidv4 } from "uuid";

const Home = ({userObj}) => {
    const[pweet, setPweet] = useState("");
    const [pweets, setPweets] = useState([]);
    const [attachment, setAttachment] = useState("");
    useEffect(() => {
        dbService.collection("pweets").onSnapshot(snapshot => {
            const pweetArray = snapshot.docs.map(doc => ({id:doc.id, ...doc.data()}));
            setPweets(pweetArray);
        })
    }, []);
    const onSubmit =async (event) => {
        event.preventDefault();
        let attachmentUrl = "";
        if(attachment !== "") {
            const attachmentRef = storageService.ref().child(userObj.uid + "/" + uuidv4());
            const response = await attachmentRef.putString(attachment, "data_url");
            attachmentUrl = await response.ref.getDownloadURL();
        }
        const pweetObj = {
            text:pweet,
            createdAt: Date.now(),
            creatorId: userObj.uid,
            attachmentUrl
        }
        await dbService.collection("pweets").add(pweetObj);
        setPweet("");
        setAttachment("");
    }
    const onChange = (event) => {
        const {target:{value},} = event;
        setPweet(value);
    }
    const onFileChange = (event) => {
        const {target:{files}} = event;
        const theFile = files[0];
        const reader = new FileReader();
        reader.onloadend = (finishedEvent) => {
            const{currentTarget: {result}} = finishedEvent;
            setAttachment(result);
        }
        reader.readAsDataURL(theFile);
    }
    const onClearAttachment = () => setAttachment(null);
    return (
        <div>
            <form onSubmit={onSubmit}>
                <input value = {pweet} onChange ={onChange} type="text" placeholder="What's on your mind?" maxLength={120} />
                <input type="file" accept="image/*" onChange={onFileChange}/>
                <input type="submit" value="Pweet"/>
                {attachment && (
                    <div>
                        <img src = {attachment} width="50px" height="50px"/>
                        <button onClick={onClearAttachment}>Clear</button>
                    </div>
                )}
            </form>
            <div>
                {pweets.map((pweet) => (
                    <Pweet key={pweet.id} pweetObj={pweet} isOwner={pweet.creatorId === userObj.uid}/>
                ))}
            </div>
        </div>
    );
}
export default Home;