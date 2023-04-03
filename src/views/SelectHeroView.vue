<template>
    <div class="select_hero">
        <div class="heros">
            <div class="heros_hero"></div>
            <div class="heros_hero"></div>
            <div class="heros_hero"></div>
            <div class="heros_hero"></div>
            <div class="heros_hero"></div>
            <div class="heros_hero"></div>
            <div class="heros_hero"></div>
            <div class="heros_hero"></div>
        </div>
        <div class="hero_info">
            <div class="hero_image">
                <div class="skills">
                    <div class="skill"></div>
                    <div class="skill"></div>
                </div>
            </div>
            <div class="hero_bio"></div>
            <div class="chat"></div>
        </div>
        <div class="players">
            <div class="player"></div>
            <div class="player"></div>
            <div class="player"></div>
            <div class="player"></div>
            <div class="player"></div>
        </div>
    </div>
</template>

<script>
export default {};
</script>

<style scoped>
.select_hero {
    width: 100vw;
    height: 100vh;
    display: flex;
    /* justify-content: center;
    align-items: center;
    position: absolute; */
}

.select_hero > div {
    margin-top: 2%;
    margin-left: 1%;
    height: 93%;
}

.heros {
    width: 20%;
    background-color: aqua;
}

.heros_hero {
    float: left;
    width: 48%;
    padding-top: 48%;
    height: 0%;
    margin-left: 1%;
    margin-top: 1%;
    background-color: darkorchid;
}

.hero_info {
    width: 51%;
    background-color: brown;
}

.hero_info > div {
    width: 98%;
    margin-top: 1%;
    margin-left: 1%;
}

.hero_image {
    display: flex;
    height: 48%;
    background-color: aquamarine;
}

.skills {
    display: flex;
    width: 21%;
    height: 17%;
    margin-left: 76%;
    margin-top: 42%;
    background-color: black;
}

.skill {
    width: 40%;
    padding-top: 40%;
    height: 0%;
    margin-top: 1%;
    margin-left: 7%;
    background-color: beige;
}

.hero_bio {
    height: 24%;
    background-color: bisque;
}

.chat {
    height: 24%;
    background-color: darkgrey;
}

.players {
    width: 25%;
    background-color: coral;
}

.players > div {
    width: 96%;
    margin-top: 2%;
    margin-left: 2%;
    background-color: chartreuse;
}

.player {
    height: 19%;
}
</style>