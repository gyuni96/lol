import React, {useState} from 'react';
import { lolApi } from '../../api'
// import styled from 'styled-components'
import MatchingTile from '../../components/matchingTile';


const Search = ()=>{

    const [ id, setId ] = useState('')
    const [ mainPlayerData, setMainPlayerData ] = useState([])
    const [ playerData , setPlayerData ] = useState()
    

    const onKeyPress = async (e)=>{
        if(e.key === "Enter"){
            setId(e.target.value)
        }

        const user = await search(id)

        const matchId = await match(user)

        const result = await MatchLog(matchId,user)
        
        setPlayerData(result.result)
        setMainPlayerData(result.mainPlayerData)
        
        
    }


    return(
        <>
            <input type="text" onKeyPress={onKeyPress} />
            <div>
                <p>값 : {id}</p>
                {
                    mainPlayerData.map((item,index)=>{
                
                        return <MatchingTile data={item[0]} key={index} team={playerData}/>
                
                    })
                }
            </div>

        </>
    )
}

//닉네임으로 accountId 검색
async function search(name){
    const result = await lolApi.searchSummonerById(name);
    // console.log(result)
    const {data:summonerId} = result
    
    return summonerId.accountId
    // setUers(summonerId.accountId)
    // // console.log(summonerId)
    
    // match(user)
    
}

//accountId로 최근 15게임 매치 id 확인
async function match(user){
    const result = await lolApi.searchMatchById(user);

    const {data:matchList} = result

    // console.log(matchList)

    var a = []
    
    for(var i = 0 ; i < 10 ; i++){
        a.push(matchList.matches[i].gameId)
    }
    
    return a

    // setMathes(a)
    // // console.log(matches)
    
    // for(var j = 0 ; j < matches.length; j++){
    //     MatchLog(matches[j])
    // }
}

async function MatchLog (idList,user){

    const result = await Promise.all(
        idList.map(async(item)=> {
            const result = await lolApi.searchIdByMatch(item);
            const {data} = result
            // console.log(data);
            // console.log(data.participantIdentities)
    
            const player = data.participants.map((item, idx)=>{
                // console.log(item)
                return (
                    {
                        'teamId' : item.teamId,
                        'champId' : item.championId,
                        'spell1Id' : item.spell1Id,
                        'spell2Id' : item.spell2Id,
                        'champLevel' : item.stats.champLevel,
                        'K' : `${item.stats.kills}`,
                        'D' : `${item.stats.deaths}`,
                        'A' : `${item.stats.assists}`,
                        'KDA' : `${((item.stats.kills+item.stats.assists)/item.stats.deaths).toFixed(2)}`,
                        'item' : [
                            item.stats.item0,
                            item.stats.item1,
                            item.stats.item2,
                            item.stats.item3,
                            item.stats.item4,
                            item.stats.item5,
                            item.stats.item6,
                        ],
                        'teamwin' : item.stats.win,
                        'cs' : `${item.stats.neutralMinionsKilled + item.stats.totalMinionsKilled}`,
                        'participantId' : idx+1
                    }
                )
            })
            const match = data.participantIdentities.map((i,idx)=>{
                return(
                    {
                        'accountId' : i.player.accountId,
                        'participantId' : i.participantId,
                        'name' : i.player.summonerName
                    } 
                )
            })
            
            return { player, match }
        })
    )
    

    //메인 플레이어 데이터
    const mainPlayerData = result.map(({player,match})=>{
        const mainPlayer = match.filter(item=>item.accountId === user)
        return player.filter(item=>item.participantId === mainPlayer[0].participantId)
    })

    
    return { mainPlayerData, result }
}


export default Search
