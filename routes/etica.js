// Import dependencies
const express = require("express");

const Web3 = require('web3');
const DbTransactionKnex = require("../DbTransactionKnex.js");

const dotenv = require('dotenv');
dotenv.config();


const MAINRPC = process.env.MAIN_RPC;
let web3 = new Web3(new Web3.providers.HttpProvider(MAINRPC));
const dbTransaction = new DbTransactionKnex();


// Setup the router for express
const router = express.Router();

// *************************
// Set up the route handlers
// *************************


function generatePaginationLinks(currentPage, totalPages, baseUrl) {
    var links = {};

    links['current'] = `${baseUrl}?page=${currentPage}`;

    // Generate the previous page link
    if (currentPage > 1) {
        links['previous'] = `${baseUrl}?page=${currentPage - 1}`;
    } else {
        links['previous'] = null;
    }

    if (currentPage + 1 <= totalPages) {
        links['next'] = `${baseUrl}?page=${currentPage + 1}`;
    } else {
        links['next'] = null;
    }

    links['first'] = `${baseUrl}?page=${1}`;

    links['last'] = `${baseUrl}?page=${totalPages}`;

    return links;
}


router.get("/periods", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/periods"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = periods.length > 0 ? periods.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const periods = await dbTransaction.periodsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        periods,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});

router.get("/diseases", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/diseases"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = diseases.length > 0 ? diseases.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const diseases = await dbTransaction.diseasesPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        diseases,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});

router.get("/proposals", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/proposals"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = proposals.length > 0 ? proposals.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const proposals = await dbTransaction.proposalsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        proposals,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});

router.get("/chunks", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/chunks"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = chunks.length > 0 ? chunks.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const chunks = await dbTransaction.chunksPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        chunks,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});

router.get("/transactions", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/transactions"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = transactions.length > 0 ? transactions.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const transactions = await dbTransaction.etransactionsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        transactions,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});

router.get("/blocks", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 1000; // Adjust the page size as needed
    const baseUrl = "/api/etica/blocks"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const blocksResults = await dbTransaction.blocksPaginated(page, pageSize);
    const blocks = blocksResults.results;
    const totalItems = blocksResults.totalCount;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    
    res.send({
        ok: true,
        blocks,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});



router.get("/rewardclaims", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/rewardclaims"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = rewardclaims.length > 0 ? rewardclaims.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const rewardclaims = await dbTransaction.rewardclaimsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        rewardclaims,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});

router.get("/stakeclaims", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/stakeclaims"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = stakeclaims.length > 0 ? stakeclaims.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const stakeclaims = await dbTransaction.stakeclaimsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        stakeclaims,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/newfees", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/newfees"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = newfees.length > 0 ? newfees.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const newfees = await dbTransaction.newfeesPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        newfees,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/newslashs", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/newslashs"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = newslashs.length > 0 ? newslashs.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const newslashs = await dbTransaction.newslashsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        newslashs,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/newcommits", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/newcommits"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = newcommits.length > 0 ? newcommits.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const newcommits = await dbTransaction.newcommitsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        newcommits,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/newreveals", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/newreveals"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = newreveals.length > 0 ? newreveals.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const newreveals = await dbTransaction.newrevealsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        newreveals,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/newstakes", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/newstakes"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = newstakes.length > 0 ? newstakes.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const newstakes = await dbTransaction.newstakesPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        newstakes,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/transfers", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/transfers"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = transfers.length > 0 ? transfers.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const transfers = await dbTransaction.transfersPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        transfers,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/mints", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/mints"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = mints.length > 0 ? mints.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const mints = await dbTransaction.mintsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        mints,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/newstakescsldts", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/newstakescsldts"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = newstakescsldts.length > 0 ? newstakescsldts.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const newstakescsldts = await dbTransaction.newstakescsldtsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        newstakescsldts,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/newstakesnaps", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/newstakesnaps"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = newstakesnaps.length > 0 ? newstakesnaps.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const newstakesnaps = await dbTransaction.newstakesnapsPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        newstakesnaps,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/propsdatas", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/propsdatas"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = propsdatas.length > 0 ? propsdatas.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const propsdatas = await dbTransaction.propsdatasPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        propsdatas,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});


router.get("/newrecovers", [], async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Adjust the page size as needed
    const baseUrl = "/api/etica/newrecovers"; // Adjust the base URL as needed

    // Retrieve data from the database with pagination
    const totalItems = newrecovers.length > 0 ? newrecovers.length : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const newrecovers = await dbTransaction.newrecoversPaginated(page, pageSize);

    // Generate pagination links
    const paginationLinks = generatePaginationLinks(page, totalPages, baseUrl);

    // Send response with pagination links and data
    res.send({
        ok: true,
        newrecovers,
        pagination: {
            currentPage: page,
            totalPages,
            links: paginationLinks
        }
    });

});



router.get("/periodvotes", [], async (req, res) => {

    try {
        // Get the period information
        const periodId = parseInt(req.query.periodId) || 1;
        const page = parseInt(req.query.page) || 1;
        const pageSize = 1000; // Adjust the page size as needed

        // Get all proposals within the given period
        const proposals = await dbTransaction.getPeriodProposals(periodId);

        let votesAmount = web3.utils.toBN('0');
        let nbVotes = web3.utils.toBN('0');

        // Loop through each proposal to retrieve its last votes
        for (const proposal of proposals) {
            // Retrieve the last reveals for the current proposal
            const proposalReveals = await dbTransaction.getProposalReveals(proposal.proposed_release_hash);

            for (const proposalReveal of proposalReveals) {
                if (proposalReveal.amount) {
                    const proposalRevealAmountBN = web3.utils.toBN(proposalReveal.amount);
                    votesAmount = votesAmount.add(proposalRevealAmountBN);

                    nbVotes = nbVotes.add(web3.utils.toBN('1'));
                }
            }
        }

        let avgVote = 0;
        if (nbVotes.gt(web3.utils.toBN('0'))) {
            avgVote = votesAmount.div(nbVotes);
        }

        votesAmount = votesAmount.toString();
        avgVote = avgVote.toString();

        // Prepare response data
        const responseData = {
            querysuccess: true,
            votesamount: votesAmount,
            nbvotes: nbVotes,
            avgvote: avgVote
        };

        res.send({
            ok: true,
            responseData,
        });


    } catch (error) {
        console.error('Error retrieving period votes stats:', error);
        throw error;
    }

});


// Export the router
module.exports = router;